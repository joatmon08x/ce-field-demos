import type { Activity } from "@prisma/client";
import { recordActivity, type NudgeSentPayload } from "@/lib/collections/activity";
import { outstandingCents } from "@/lib/collections/balance";
import { formatDate } from "@/lib/dates";
import { formatUsd } from "@/lib/money";
import { prisma } from "@/lib/prisma";

const DELIVERABLE_EMAIL = /^[^\s@]+@[^\s@]+$/;

export class NudgeError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(status === 404 ? "Invoice not found" : "Nudge failed");
    this.name = "NudgeError";
    this.status = status;
  }
}

export function isDeliverableEmail(value: string | null | undefined): boolean {
  if (typeof value !== "string") return false;
  return DELIVERABLE_EMAIL.test(value.trim());
}

export function nudgeTemplate({
  invoiceNumber,
  outstandingCents: balance,
  dueOn,
}: {
  invoiceNumber: string;
  outstandingCents: number;
  dueOn: Date;
}): string {
  return `Invoice ${invoiceNumber} has ${formatUsd(balance)} outstanding, due ${formatDate(dueOn)}.`;
}

export async function sendNudge(invoiceId: string): Promise<{
  status: "sent" | "failed";
  activity: Activity;
  to: string;
  template: string;
  reason?: string;
}> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { customer: true, payments: true },
  });
  if (!invoice) {
    throw new NudgeError(404);
  }

  const balance = outstandingCents(invoice);
  const template = nudgeTemplate({
    invoiceNumber: invoice.number,
    outstandingCents: balance,
    dueOn: invoice.dueOn,
  });
  const to = invoice.customer.email;
  const deliverable = isDeliverableEmail(to);
  const status = deliverable ? "sent" : "failed";
  const reason = deliverable ? undefined : "missing or invalid email";
  const payload: NudgeSentPayload = {
    invoiceNumber: invoice.number,
    toEmail: to,
    channel: "email",
    outstandingCents: balance,
    dueOn: invoice.dueOn.toISOString(),
  };
  if (reason) payload.reason = reason;

  // No email provider. Writing the activity is the send.
  const activity = await recordActivity({
    customerId: invoice.customerId,
    invoiceId: invoice.id,
    type: "NUDGE_SENT",
    status,
    payload,
  });

  return { status, activity, to, template, reason };
}
