import { DEMO_AS_OF } from "@/lib/clock";
import { formatDate } from "@/lib/dates";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { formatUsd } from "@/lib/money";
import { outstandingCents } from "@/lib/overdue-book";
import { prisma } from "@/lib/prisma";

export const NUDGE_SENT = "NUDGE_SENT";
export const NUDGE_CHANNEL_EMAIL = "email";
export const NUDGE_STATUS_SENT = "sent";
export const NUDGE_STATUS_FAILED = "failed";

const ON_FILE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isOnFileEmail(value: string | null | undefined): value is string {
  return typeof value === "string" && ON_FILE_EMAIL.test(value.trim());
}

type NudgeInvoice = {
  number: string;
  dueOn: Date;
  totalCents: number;
  payments?: readonly { amountCents: number }[];
};

/** Fixed reminder. Names the invoice number, outstanding balance, and due date. */
export function nudgeTemplate(invoice: NudgeInvoice): string {
  const balance = formatUsd(outstandingCents(invoice));
  const due = formatDate(invoice.dueOn);
  return `Invoice ${invoice.number} has an outstanding balance of ${balance} and was due on ${due}.`;
}

export function nudgeSubject(invoiceNumber: string): string {
  return `Reminder for ${invoiceNumber}`;
}

export type NudgeMail = {
  to: string;
  channel: typeof NUDGE_CHANNEL_EMAIL;
  subject: string;
  body: string;
  invoiceId: string;
};

export type NudgeTransportResult = { ok: true } | { ok: false; reason: string };

export type NudgeTransport = {
  send(mail: NudgeMail): Promise<NudgeTransportResult>;
};

const recorded: NudgeMail[] = [];

export function recordedNudges(): readonly NudgeMail[] {
  return recorded;
}

export function clearRecordedNudges(): void {
  recorded.length = 0;
}

/** In-process stand-in for email. Records the message and does not send it. */
export const recordingNudgeTransport: NudgeTransport = {
  async send(mail) {
    recorded.push({ ...mail });
    return { ok: true };
  },
};

export type NudgeActivity = {
  id: string;
  customerId: string;
  invoiceId: string | null;
  type: string;
  status: string;
  channel: string | null;
  body: string | null;
  amountCents: number | null;
  actorName: string;
  occurredOn: Date;
  to: string;
};

type NudgeFailure = { ok: false; status: 400 | 404; error: string };

type NudgeTarget = {
  id: string;
  customerId: string;
  number: string;
  dueOn: Date;
  totalCents: number;
  payments: readonly { amountCents: number }[];
};

async function recordNudgeActivity(
  invoice: NudgeTarget,
  body: string,
  status: typeof NUDGE_STATUS_SENT | typeof NUDGE_STATUS_FAILED,
) {
  return prisma.activity.create({
    data: {
      id: `act_${crypto.randomUUID()}`,
      customerId: invoice.customerId,
      invoiceId: invoice.id,
      type: NUDGE_SENT,
      status,
      channel: NUDGE_CHANNEL_EMAIL,
      body,
      amountCents: outstandingCents(invoice),
      actorName: DEMO_OPERATOR.name,
      occurredOn: DEMO_AS_OF,
    },
  });
}

export async function sendInvoiceNudge(
  invoiceId: string,
  transport: NudgeTransport = recordingNudgeTransport,
): Promise<{ ok: true; activity: NudgeActivity } | NudgeFailure> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      payments: { select: { amountCents: true } },
      customer: { select: { email: true } },
    },
  });
  if (!invoice) {
    return { ok: false, status: 404, error: "Invoice not found" };
  }
  if (invoice.status !== "OVERDUE") {
    return { ok: false, status: 400, error: "Only an OVERDUE invoice can be nudged." };
  }

  const body = nudgeTemplate(invoice);
  const email = invoice.customer.email;
  if (!isOnFileEmail(email)) {
    const activity = await recordNudgeActivity(invoice, body, NUDGE_STATUS_FAILED);
    return {
      ok: true,
      activity: { ...activity, to: email.trim() },
    };
  }

  const delivery = await transport.send({
    to: email.trim(),
    channel: NUDGE_CHANNEL_EMAIL,
    subject: nudgeSubject(invoice.number),
    body,
    invoiceId: invoice.id,
  });
  if (!delivery.ok) {
    return { ok: false, status: 400, error: "Nudge was not sent." };
  }

  const activity = await recordNudgeActivity(invoice, body, NUDGE_STATUS_SENT);
  return {
    ok: true,
    activity: { ...activity, to: email.trim() },
  };
}
