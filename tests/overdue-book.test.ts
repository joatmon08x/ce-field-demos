import { describe, expect, it } from "vitest";
import { DEMO_AS_OF } from "@/lib/clock";
import { daysPastDue, mostPastDueOverdue, outstandingCents, sortOverdue } from "@/lib/collections/balance";

function daysBefore(days: number): Date {
  return new Date(DEMO_AS_OF.getTime() - days * 86_400_000);
}

describe("outstanding balance", () => {
  it("subtracts payments and floors at 0", () => {
    expect(outstandingCents({ totalCents: 24900, payments: [] })).toBe(24900);
    expect(
      outstandingCents({
        totalCents: 24900,
        payments: [{ amountCents: 9900 }, { amountCents: 4900 }],
      }),
    ).toBe(10100);
    expect(
      outstandingCents({
        totalCents: 4900,
        payments: [{ amountCents: 4900 }, { amountCents: 9900 }],
      }),
    ).toBe(0);
  });
});

describe("overdue book", () => {
  const older = { id: "older", status: "OVERDUE", dueOn: daysBefore(20) };
  const newer = { id: "newer", status: "OVERDUE", dueOn: daysBefore(3) };
  const open = { id: "open", status: "OPEN", dueOn: daysBefore(30) };
  const paid = { id: "paid", status: "PAID", dueOn: daysBefore(10) };

  it("drops non-OVERDUE rows and orders days-past-due descending", () => {
    expect(daysPastDue(open)).toBe(0);
    expect(daysPastDue(older)).toBe(20);
    expect(sortOverdue([newer, open, older, paid]).map((invoice) => invoice.id)).toEqual([
      "older",
      "newer",
    ]);
  });

  it("picks the oldest overdue invoice and returns null when there is none", () => {
    expect(mostPastDueOverdue([newer, open, older])?.id).toBe("older");
    expect(mostPastDueOverdue([open, paid])).toBeNull();
    expect(mostPastDueOverdue([])).toBeNull();
  });
});
