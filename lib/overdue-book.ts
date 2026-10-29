import { DEMO_AS_OF } from "@/lib/clock";
import { daysBetween } from "@/lib/dates";
import { sumCents } from "@/lib/money";

/** No Activity rows exist yet. The Overdue Book shows this em dash. */
export const NO_ACTIVITY_LABEL = "\u2014";

export type OverdueBookInvoice = {
  id: string;
  number: string;
  status: string;
  issuedOn: Date;
  dueOn: Date;
  totalCents: number;
  payments?: readonly { amountCents: number }[];
};

export function daysPastDue(dueOn: Date, asOf: Date = DEMO_AS_OF): number {
  return Math.max(0, daysBetween(asOf, dueOn));
}

/** Outstanding balance is the invoice total minus recorded payments. */
export function outstandingCents(invoice: {
  totalCents: number;
  payments?: readonly { amountCents: number }[];
}): number {
  const paid = sumCents((invoice.payments ?? []).map((payment) => payment.amountCents));
  return Math.max(0, invoice.totalCents - paid);
}

export function lastActivityOn(activities: readonly { occurredOn: Date }[]): Date | null {
  let latest: Date | null = null;
  for (const activity of activities) {
    if (!latest || activity.occurredOn.getTime() > latest.getTime()) {
      latest = activity.occurredOn;
    }
  }
  return latest;
}

/** The account Nudge targets this invoice: first row of the Overdue Book. */
export function mostPastDueOverdue<T extends OverdueBookInvoice>(
  invoices: readonly T[],
  asOf: Date = DEMO_AS_OF,
): T | null {
  return overdueBook(invoices, asOf)[0] ?? null;
}

export function overdueBook<T extends OverdueBookInvoice>(
  invoices: readonly T[],
  asOf: Date = DEMO_AS_OF,
): T[] {
  return invoices
    .filter((invoice) => invoice.status === "OVERDUE")
    .sort((left, right) => {
      const byDays = daysPastDue(right.dueOn, asOf) - daysPastDue(left.dueOn, asOf);
      if (byDays !== 0) return byDays;
      const byDue = left.dueOn.getTime() - right.dueOn.getTime();
      if (byDue !== 0) return byDue;
      return left.number.localeCompare(right.number);
    });
}

export function overdueTotals(
  invoices: readonly OverdueBookInvoice[],
  asOf: Date = DEMO_AS_OF,
): { count: number; balanceCents: number } {
  const rows = overdueBook(invoices, asOf);
  return {
    count: rows.length,
    balanceCents: sumCents(rows.map((invoice) => outstandingCents(invoice))),
  };
}
