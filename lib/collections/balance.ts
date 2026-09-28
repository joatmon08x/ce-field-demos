import { DEMO_AS_OF } from "@/lib/clock";
import { daysBetween } from "@/lib/dates";

export function outstandingCents(invoice: {
  totalCents: number;
  payments: { amountCents: number }[];
}): number {
  const paid = invoice.payments.reduce((sum, payment) => sum + payment.amountCents, 0);
  return Math.max(0, invoice.totalCents - paid);
}

export function daysPastDue(invoice: { status: string; dueOn: Date }): number {
  if (invoice.status !== "OVERDUE") return 0;
  return Math.max(0, daysBetween(DEMO_AS_OF, invoice.dueOn));
}

export function sortOverdue<T extends { status: string; dueOn: Date }>(invoices: T[]): T[] {
  return invoices
    .filter((invoice) => invoice.status === "OVERDUE")
    .sort((left, right) => daysPastDue(right) - daysPastDue(left));
}

export function mostPastDueOverdue<T extends { status: string; dueOn: Date }>(
  invoices: T[],
): T | null {
  return sortOverdue(invoices)[0] ?? null;
}
