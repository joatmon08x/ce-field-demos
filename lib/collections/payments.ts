import { randomUUID } from "node:crypto";
import { outstandingCents } from "@/lib/collections/balance";
import { recordActivity } from "@/lib/collections/activity";
import { DEMO_AS_OF } from "@/lib/clock";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const PAYMENT_METHODS = ["check", "ach", "card_on_file", "cash"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  check: "Check",
  ach: "ACH",
  card_on_file: "Card on file",
  cash: "Cash",
};

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === "string" && (PAYMENT_METHODS as readonly string[]).includes(value);
}

export function paymentMethodLabel(method: string): string {
  if (isPaymentMethod(method)) return PAYMENT_METHOD_LABEL[method];
  return method;
}

export class PaymentError extends Error {
  readonly status: 400 | 404;

  constructor(message: string, status: 400 | 404) {
    super(message);
    this.name = "PaymentError";
    this.status = status;
  }
}

export async function recordFullPayment(invoiceId: string, method: PaymentMethod) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true, customer: true },
  });
  if (!invoice) {
    throw new PaymentError("Invoice not found", 404);
  }

  const amountCents = outstandingCents(invoice);
  if (amountCents === 0) {
    throw new PaymentError("Invoice has no outstanding balance", 400);
  }

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        id: `pay_${randomUUID()}`,
        invoiceId: invoice.id,
        amountCents,
        method,
        recordedBy: DEMO_OPERATOR.name,
        recordedAt: new Date(),
      },
    });
    const updated = await tx.invoice.update({
      where: { id: invoice.id },
      data: { status: "PAID", paidOn: DEMO_AS_OF },
    });
    await recordActivity(
      {
        customerId: invoice.customer.id,
        invoiceId: invoice.id,
        type: "PAYMENT_RECORDED",
        status: "recorded",
        payload: {
          invoiceNumber: invoice.number,
          amountCents,
          method,
        },
      },
      tx,
    );
    return { payment, invoice: updated };
  });
}
