import { DEMO_AS_OF } from "@/lib/clock";
import { daysBetween, formatDate } from "@/lib/dates";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { formatUsd, sumCents } from "@/lib/money";

export const PAYMENT_METHODS = ["check", "ach", "card_on_file", "cash"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === "string" && (PAYMENT_METHODS as readonly string[]).includes(value);
}

export const ACTIVITY_TYPES = ["NOTE_ADDED", "NUDGE_SENT", "PAYMENT_RECORDED"] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_STATUSES = ["recorded", "sent", "failed"] as const;

export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export function outstandingCents(totalCents: number, payments: { amountCents: number }[]): number {
  return Math.max(0, totalCents - sumCents(payments.map((payment) => payment.amountCents)));
}

export const NOTE_EDIT_WINDOW_MS = 15 * 60_000;

/**
 * A note created in the future has a negative age, which still falls inside the window.
 */
export function canEditNote(
  note: { authorName: string; createdAt: Date },
  now: Date = new Date(),
): boolean {
  if (note.authorName !== DEMO_OPERATOR.name) return false;
  return now.getTime() - note.createdAt.getTime() < NOTE_EDIT_WINDOW_MS;
}

export function isEmailAddress(value: string | null | undefined): boolean {
  if (!value) return false;
  const at = value.indexOf("@");
  if (at <= 0 || at !== value.lastIndexOf("@")) return false;
  const domain = value.slice(at + 1);
  const labels = domain.split(".");
  return labels.length >= 2 && labels.every((label) => label.length > 0);
}

export function nudgeTemplate(input: {
  invoiceNumber: string;
  outstandingCents: number;
  dueOn: Date;
}): string {
  return `Reminder: invoice ${input.invoiceNumber} for ${formatUsd(input.outstandingCents)} was due ${formatDate(input.dueOn)} and is still outstanding. Reply to this note or send payment when you can.`;
}

export type OverdueBookRow<T> = T & { daysPastDue: number };

export function overdueBookRows<T extends { status: string; dueOn: Date }>(
  invoices: T[],
  asOf: Date = DEMO_AS_OF,
): OverdueBookRow<T>[] {
  return invoices
    .filter((invoice) => invoice.status === "OVERDUE")
    .map((invoice) => ({
      ...invoice,
      daysPastDue: Math.max(0, daysBetween(asOf, invoice.dueOn)),
    }))
    .sort((a, b) => b.daysPastDue - a.daysPastDue);
}
