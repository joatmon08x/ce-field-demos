import { isPaymentMethod, type PaymentMethod } from "@/lib/collections";
import { prisma } from "@/lib/prisma";

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  check: "Check",
  ach: "ACH",
  card_on_file: "Card on file",
  cash: "Cash",
};

export function paymentMethodLabel(method: string): string {
  if (!isPaymentMethod(method)) return method;
  return PAYMENT_METHOD_LABELS[method];
}

export async function getInvoicePayments(invoiceId: string) {
  return prisma.payment.findMany({
    where: { invoiceId },
    orderBy: { recordedAt: "desc" },
  });
}
