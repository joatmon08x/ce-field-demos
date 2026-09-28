import { describe, expect, it } from "vitest";
import { DEMO_AS_OF } from "@/lib/clock";
import {
  activitiesInWindow,
  activitiesOnDay,
  overdueInvoiceCount,
  overdueTotalCents,
} from "@/lib/dashboard";
import { PLAN_PRICE_CENTS } from "@/lib/plans";

function daysBefore(days: number) {
  const date = new Date(DEMO_AS_OF);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

describe("overdueTotalCents", () => {
  it("uses catalog cents, subtracts payments, and ignores PAID and OPEN rows", () => {
    expect(
      overdueTotalCents([
        {
          status: "OVERDUE",
          totalCents: PLAN_PRICE_CENTS.SCALE,
          payments: [{ amountCents: PLAN_PRICE_CENTS.STARTER }],
        },
        {
          status: "OVERDUE",
          totalCents: PLAN_PRICE_CENTS.GROWTH,
          payments: [],
        },
        {
          status: "PAID",
          totalCents: PLAN_PRICE_CENTS.SCALE,
          payments: [],
        },
        {
          status: "OPEN",
          totalCents: PLAN_PRICE_CENTS.STARTER,
          payments: [],
        },
      ]),
    ).toBe(PLAN_PRICE_CENTS.SCALE - PLAN_PRICE_CENTS.STARTER + PLAN_PRICE_CENTS.GROWTH);
  });
});

describe("overdueInvoiceCount", () => {
  it("ignores PAID rows", () => {
    expect(
      overdueInvoiceCount([
        { status: "OVERDUE" },
        { status: "PAID" },
        { status: "OVERDUE" },
        { status: "OPEN" },
      ]),
    ).toBe(2);
  });
});

describe("activitiesOnDay", () => {
  it("counts a DEMO_AS_OF row and not one from the day before", () => {
    expect(
      activitiesOnDay(
        [{ occurredOn: DEMO_AS_OF }, { occurredOn: daysBefore(1) }],
        DEMO_AS_OF,
      ),
    ).toBe(1);
  });
});

describe("activitiesInWindow", () => {
  it("counts a row 6 days back and not 8 days back", () => {
    const start = daysBefore(6);
    expect(
      activitiesInWindow(
        [{ occurredOn: start }, { occurredOn: daysBefore(8) }, { occurredOn: DEMO_AS_OF }],
        start,
        DEMO_AS_OF,
      ),
    ).toBe(2);
  });
});
