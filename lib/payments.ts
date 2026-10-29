import { DEMO_AS_OF } from "@/lib/clock";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { outstandingCents } from "@/lib/overdue-book";
import { prisma } from "@/lib/prisma";

export const PAYMENT_METHODS = ["check", "ach", "card_on_file", "cash"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  check: "Check",
  ach: "ACH",
  card_on_file: "Card on file",
  cash: "Cash",
};

export const PAYMENT_RECORDED = "PAYMENT_RECORDED";
export const PAYMENT_ACTIVITY_STATUS = "recorded";

const PAYABLE_STATUSES = new Set(["OPEN", "OVERDUE"]);

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === "string" && (PAYMENT_METHODS as readonly string[]).includes(value);
}

export function paymentMethodLabel(method: string): string {
  return isPaymentMethod(method) ? PAYMENT_METHOD_LABEL[method] : method;
}

export function canRecordPayment(invoice: {
  status: string;
  totalCents: number;
  payments?: readonly { amountCents: number }[];
}): boolean {
  return PAYABLE_STATUSES.has(invoice.status) && outstandingCents(invoice) > 0;
}

type PaymentFailure = { ok: false; status: 400 | 404; error: string };

export async function recordFullPayment(invoiceId: string, method: unknown) {
  if (!isPaymentMethod(method)) {
    return {
      ok: false as const,
      status: 400 as const,
      error: "Payment method must be check, ach, card_on_file, or cash.",
    };
  }

  return prisma.$transaction(async (tx): Promise<
    | PaymentFailure
    | {
        ok: true;
        payment: {
          id: string;
          invoiceId: string;
          amountCents: number;
          method: string;
          recordedBy: string;
          recordedAt: Date;
        };
        activity: {
          id: string;
          customerId: string;
          invoiceId: string | null;
          type: string;
          status: string;
          amountCents: number | null;
          method: string | null;
          actorName: string;
          occurredOn: Date;
        };
      }
  > => {
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: { select: { amountCents: true } } },
    });
    if (!invoice) {
      return { ok: false, status: 404, error: "Invoice not found" };
    }

    const amountCents = outstandingCents(invoice);
    if (amountCents === 0) {
      return { ok: false, status: 400, error: "Outstanding balance is 0." };
    }
    if (!PAYABLE_STATUSES.has(invoice.status)) {
      return { ok: false, status: 400, error: "Invoice is not open for payment." };
    }

    const payment = await tx.payment.create({
      data: {
        id: `pay_${crypto.randomUUID()}`,
        invoiceId: invoice.id,
        amountCents,
        method,
        recordedBy: DEMO_OPERATOR.name,
        recordedAt: DEMO_AS_OF,
      },
    });
    const activity = await tx.activity.create({
      data: {
        id: `act_${crypto.randomUUID()}`,
        customerId: invoice.customerId,
        invoiceId: invoice.id,
        type: PAYMENT_RECORDED,
        status: PAYMENT_ACTIVITY_STATUS,
        amountCents,
        method,
        actorName: DEMO_OPERATOR.name,
        occurredOn: DEMO_AS_OF,
      },
    });
    await tx.invoice.update({
      where: { id: invoice.id },
      data: { status: "PAID", paidOn: DEMO_AS_OF },
    });

    return { ok: true, payment, activity };
  });
}
