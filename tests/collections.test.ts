import { describe, expect, it } from "vitest";
import {
  canEditNote,
  isEmailAddress,
  isPaymentMethod,
  nudgeTemplate,
  outstandingCents,
  overdueBookRows,
  PAYMENT_METHODS,
} from "@/lib/collections";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { PLAN_PRICE_CENTS } from "@/lib/plans";

describe("isPaymentMethod", () => {
  it("accepts the four methods and rejects wire", () => {
    for (const method of PAYMENT_METHODS) {
      expect(isPaymentMethod(method)).toBe(true);
    }
    expect(isPaymentMethod("wire")).toBe(false);
  });
});

describe("outstandingCents", () => {
  it("subtracts payments and floors at zero", () => {
    expect(outstandingCents(PLAN_PRICE_CENTS.SCALE, [{ amountCents: PLAN_PRICE_CENTS.STARTER }])).toBe(
      PLAN_PRICE_CENTS.SCALE - PLAN_PRICE_CENTS.STARTER,
    );
    expect(
      outstandingCents(PLAN_PRICE_CENTS.STARTER, [{ amountCents: PLAN_PRICE_CENTS.SCALE }]),
    ).toBe(0);
  });
});

describe("canEditNote", () => {
  const now = new Date("2026-08-23T12:00:00.000Z");

  function minutesAgo(minutes: number) {
    return new Date(now.getTime() - minutes * 60_000);
  }

  it("allows Avery Quinn inside 15 minutes and refuses everyone else", () => {
    expect(canEditNote({ authorName: DEMO_OPERATOR.name, createdAt: minutesAgo(14) }, now)).toBe(true);
    expect(canEditNote({ authorName: DEMO_OPERATOR.name, createdAt: minutesAgo(16) }, now)).toBe(false);
    expect(canEditNote({ authorName: "Casey Lane", createdAt: minutesAgo(1) }, now)).toBe(false);
  });

  it("treats a future createdAt as still inside the window", () => {
    const createdAt = new Date(now.getTime() + 60_000);
    expect(canEditNote({ authorName: DEMO_OPERATOR.name, createdAt }, now)).toBe(true);
  });
});

describe("isEmailAddress", () => {
  it("requires one @ and a dotted domain", () => {
    expect(isEmailAddress("billing@acmenorth.example")).toBe(true);
    expect(isEmailAddress("")).toBe(false);
    expect(isEmailAddress("not-an-email")).toBe(false);
    expect(isEmailAddress("a@b")).toBe(false);
  });
});

describe("nudgeTemplate", () => {
  it("names the invoice, the formatted balance, and the due date", () => {
    const text = nudgeTemplate({
      invoiceNumber: "INV-1043",
      outstandingCents: PLAN_PRICE_CENTS.SCALE,
      dueOn: new Date("2026-08-04T12:00:00.000Z"),
    });
    expect(text).toContain("INV-1043");
    expect(text).toContain("$249.00");
    expect(text).toContain("Aug 4, 2026");
  });
});

describe("overdueBookRows", () => {
  it("keeps overdue invoices and sorts days past due descending", () => {
    const rows = overdueBookRows(
      [
        { id: "open", status: "OPEN", dueOn: new Date("2026-08-01T12:00:00.000Z") },
        { id: "recent", status: "OVERDUE", dueOn: new Date("2026-08-20T12:00:00.000Z") },
        { id: "old", status: "OVERDUE", dueOn: new Date("2026-08-04T12:00:00.000Z") },
        { id: "mid", status: "OVERDUE", dueOn: new Date("2026-08-10T12:00:00.000Z") },
      ],
      new Date("2026-08-23T12:00:00.000Z"),
    );

    expect(rows.map((row) => row.id)).toEqual(["old", "mid", "recent"]);
    expect(rows.map((row) => row.daysPastDue)).toEqual([19, 13, 3]);
  });
});
