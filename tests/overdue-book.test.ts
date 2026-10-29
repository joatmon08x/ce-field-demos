import { describe, expect, it } from "vitest";
import { demoDay } from "@/lib/clock";
import { PLAN_PRICE_CENTS } from "@/lib/plans";
import {
  NO_ACTIVITY_LABEL,
  daysPastDue,
  outstandingCents,
  overdueBook,
  overdueTotals,
  type OverdueBookInvoice,
} from "@/lib/overdue-book";

function invoice(
  partial: Pick<OverdueBookInvoice, "id" | "number" | "status" | "totalCents"> & {
    issuedOn: string;
    dueOn: string;
  },
): OverdueBookInvoice {
  return {
    id: partial.id,
    number: partial.number,
    status: partial.status,
    issuedOn: demoDay(partial.issuedOn),
    dueOn: demoDay(partial.dueOn),
    totalCents: partial.totalCents,
  };
}

describe("overdue book", () => {
  it("lists only OVERDUE invoices, days past due descending, against 23 Aug 2026", () => {
    const book = overdueBook([
      invoice({
        id: "inv_1047",
        number: "INV-1047",
        status: "OVERDUE",
        issuedOn: "2026-07-13",
        dueOn: "2026-08-12",
        totalCents: PLAN_PRICE_CENTS.GROWTH,
      }),
      invoice({
        id: "inv_1041",
        number: "INV-1041",
        status: "OPEN",
        issuedOn: "2026-08-07",
        dueOn: "2026-09-06",
        totalCents: PLAN_PRICE_CENTS.GROWTH,
      }),
      invoice({
        id: "inv_1043",
        number: "INV-1043",
        status: "OVERDUE",
        issuedOn: "2026-07-10",
        dueOn: "2026-08-09",
        totalCents: PLAN_PRICE_CENTS.SCALE,
      }),
      invoice({
        id: "inv_1042",
        number: "INV-1042",
        status: "PAID",
        issuedOn: "2026-07-08",
        dueOn: "2026-08-07",
        totalCents: PLAN_PRICE_CENTS.STARTER,
      }),
    ]);

    expect(book.map((row) => row.number)).toEqual(["INV-1043", "INV-1047"]);
    expect(daysPastDue(book[0]!.dueOn)).toBe(14);
    expect(daysPastDue(book[1]!.dueOn)).toBe(11);
    expect(outstandingCents(book[0]!)).toBe(PLAN_PRICE_CENTS.SCALE);
    expect(overdueTotals(book)).toEqual({
      count: 2,
      balanceCents: PLAN_PRICE_CENTS.SCALE + PLAN_PRICE_CENTS.GROWTH,
    });
  });

  it("breaks days-past-due ties by due date, then invoice number", () => {
    const book = overdueBook([
      invoice({
        id: "inv_2009",
        number: "INV-2009",
        status: "OVERDUE",
        issuedOn: "2026-07-05",
        dueOn: "2026-08-04",
        totalCents: PLAN_PRICE_CENTS.SCALE,
      }),
      invoice({
        id: "inv_2003",
        number: "INV-2003",
        status: "OVERDUE",
        issuedOn: "2026-07-05",
        dueOn: "2026-08-04",
        totalCents: PLAN_PRICE_CENTS.SCALE,
      }),
      invoice({
        id: "inv_1043",
        number: "INV-1043",
        status: "OVERDUE",
        issuedOn: "2026-07-10",
        dueOn: "2026-08-09",
        totalCents: PLAN_PRICE_CENTS.SCALE,
      }),
    ]);

    expect(book.map((row) => row.number)).toEqual(["INV-2003", "INV-2009", "INV-1043"]);
    expect(daysPastDue(demoDay("2026-08-04"))).toBe(19);
  });

  it("returns no invoice rows when the account has no OVERDUE invoices", () => {
    const invoices = [
      invoice({
        id: "inv_1041",
        number: "INV-1041",
        status: "OPEN",
        issuedOn: "2026-08-07",
        dueOn: "2026-09-06",
        totalCents: PLAN_PRICE_CENTS.GROWTH,
      }),
      invoice({
        id: "inv_1051",
        number: "INV-1051",
        status: "VOID",
        issuedOn: "2026-06-07",
        dueOn: "2026-07-07",
        totalCents: PLAN_PRICE_CENTS.STARTER,
      }),
    ];

    expect(overdueBook(invoices)).toEqual([]);
    expect(overdueTotals(invoices)).toEqual({ count: 0, balanceCents: 0 });
  });

  it("uses an em dash when the account has no activity", () => {
    expect(NO_ACTIVITY_LABEL).toBe("\u2014");
  });
});
