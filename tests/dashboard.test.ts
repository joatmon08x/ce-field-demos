import { describe, expect, it } from "vitest";
import { DEMO_AS_OF } from "@/lib/clock";
import { activityCounts, catalogMrrCents, overdueBookCents, overdueInvoiceCount, percentChange } from "@/lib/dashboard";
import { PLAN_PRICE_CENTS } from "@/lib/plans";

describe("catalogMrrCents", () => {
  it("sums only catalog plan prices", () => {
    expect(
      catalogMrrCents([{ plan: "STARTER" }, { plan: "GROWTH" }, { plan: "SCALE" }]),
    ).toBe(4900 + 9900 + 24900);
  });
});

describe("percentChange", () => {
  it("returns null when the prior period is empty and current is not", () => {
    expect(percentChange(9900, 0)).toBeNull();
  });

  it("computes a real lift without inventing a baseline", () => {
    expect(percentChange(19800, 9900)).toBe(100);
  });
});

function invoice(status: string, totalCents: number) {
  return {
    status,
    issuedOn: DEMO_AS_OF,
    paidOn: null,
    totalCents,
  };
}

describe("overdue book", () => {
  const invoices = [
    invoice("OVERDUE", PLAN_PRICE_CENTS.STARTER),
    invoice("OPEN", PLAN_PRICE_CENTS.GROWTH),
    invoice("OVERDUE", PLAN_PRICE_CENTS.SCALE),
    invoice("PAID", PLAN_PRICE_CENTS.STARTER),
  ];

  it("sums only overdue totals", () => {
    expect(overdueBookCents(invoices)).toBe(PLAN_PRICE_CENTS.STARTER + PLAN_PRICE_CENTS.SCALE);
  });

  it("counts overdue invoices", () => {
    expect(overdueInvoiceCount(invoices)).toBe(2);
  });
});

describe("activityCounts", () => {
  function daysBefore(days: number) {
    const occurredOn = new Date(DEMO_AS_OF);
    occurredOn.setUTCDate(occurredOn.getUTCDate() - days);
    return occurredOn;
  }

  it("counts the demo day and the seven-day window ending that day", () => {
    expect(activityCounts([{ occurredOn: DEMO_AS_OF }])).toEqual({ today: 1, week: 1 });
    expect(activityCounts([{ occurredOn: daysBefore(3) }])).toEqual({ today: 0, week: 1 });
    expect(activityCounts([{ occurredOn: daysBefore(10) }])).toEqual({ today: 0, week: 0 });
  });
});
