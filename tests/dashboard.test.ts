import { afterEach, describe, expect, it } from "vitest";
import { DEMO_AS_OF } from "@/lib/clock";
import {
  catalogMrrCents,
  collectionsActivityCounts,
  collectionsActivityWindow,
  collectionsOverdue,
  percentChange,
} from "@/lib/dashboard";
import { getDashboard } from "@/lib/data";
import { PLAN_PRICE_CENTS } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

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

describe("collectionsOverdue", () => {
  it("sums catalog prices for overdue invoices and skips other statuses", () => {
    expect(
      collectionsOverdue([
        { status: "OVERDUE", plan: "SCALE" },
        { status: "OVERDUE", plan: "GROWTH" },
        { status: "OPEN", plan: "SCALE" },
        { status: "PAID", plan: "STARTER" },
        { status: "DRAFT", plan: "GROWTH" },
      ]),
    ).toEqual({
      overdueCount: 2,
      overdueCents: PLAN_PRICE_CENTS.SCALE + PLAN_PRICE_CENTS.GROWTH,
    });
  });

  it("keeps a non-catalog plan and an inflated total out of the balance", () => {
    const invoices = [
      { status: "OVERDUE", plan: "SCALE", totalCents: 40000 },
      { status: "OVERDUE", plan: "TRIAL", totalCents: 100000 },
    ];
    expect(collectionsOverdue(invoices)).toEqual({
      overdueCount: 2,
      overdueCents: PLAN_PRICE_CENTS.SCALE,
    });
  });
});

describe("collectionsActivityCounts", () => {
  it("counts every activity type on the demo day and in the 7 days ending that day", () => {
    const { dayStart, weekStart } = collectionsActivityWindow(DEMO_AS_OF);
    const rows = [
      { type: "NOTE", occurredOn: DEMO_AS_OF },
      { type: "NUDGE_SENT", occurredOn: new Date(dayStart) },
      { type: "PAYMENT_RECORDED", occurredOn: new Date(weekStart) },
      { type: "OTHER", occurredOn: new Date("2026-08-20T18:00:00.000Z") },
    ];
    expect(collectionsActivityCounts(rows, DEMO_AS_OF)).toEqual({ today: 2, week: 4 });
  });

  it("excludes the day before the window and the day after the demo day", () => {
    const { dayEnd, weekStart } = collectionsActivityWindow(DEMO_AS_OF);
    expect(
      collectionsActivityCounts(
        [
          { occurredOn: new Date(weekStart - 1) },
          { occurredOn: new Date(dayEnd) },
        ],
        DEMO_AS_OF,
      ),
    ).toEqual({ today: 0, week: 0 });
  });
});

describe("getDashboard collections", () => {
  const ids = ["act_kpi_note", "act_kpi_nudge", "act_kpi_old"];

  afterEach(async () => {
    await prisma.activity.deleteMany({ where: { id: { in: ids } } });
  });

  it("includes newly recorded activities on the next read", async () => {
    await prisma.activity.createMany({
      data: [
        {
          id: "act_kpi_note",
          customerId: "cus_quarrypine",
          type: "NOTE",
          status: "saved",
          actorName: "Avery Quinn",
          occurredOn: DEMO_AS_OF,
        },
        {
          id: "act_kpi_nudge",
          customerId: "cus_quarrypine",
          type: "NUDGE_SENT",
          status: "sent",
          actorName: "Avery Quinn",
          occurredOn: new Date("2026-08-17T12:00:00.000Z"),
        },
        {
          id: "act_kpi_old",
          customerId: "cus_quarrypine",
          type: "PAYMENT_RECORDED",
          status: "recorded",
          actorName: "Avery Quinn",
          occurredOn: new Date("2026-08-16T12:00:00.000Z"),
        },
      ],
    });

    const invoiceKey = (rows: { status: string; plan: string }[]) =>
      rows
        .map((row) => `${row.status}:${row.plan}`)
        .sort()
        .join("|");
    const activityKey = (rows: { id: string; occurredOn: Date }[]) =>
      rows
        .map((row) => `${row.id}:${row.occurredOn.toISOString()}`)
        .sort()
        .join("|");

    let matched = false;
    for (let attempt = 0; attempt < 8 && !matched; attempt += 1) {
      const invoices = await prisma.invoice.findMany({ select: { status: true, plan: true } });
      const activities = await prisma.activity.findMany({ select: { id: true, occurredOn: true } });
      const dashboard = await getDashboard();
      const invoicesAfter = await prisma.invoice.findMany({ select: { status: true, plan: true } });
      const activitiesAfter = await prisma.activity.findMany({ select: { id: true, occurredOn: true } });
      if (invoiceKey(invoices) !== invoiceKey(invoicesAfter)) continue;
      if (activityKey(activities) !== activityKey(activitiesAfter)) continue;

      const overdue = collectionsOverdue(invoices);
      const counts = collectionsActivityCounts(activities);
      try {
        expect(dashboard.kpis.collections).toEqual({
          overdueCount: overdue.overdueCount,
          overdueCents: overdue.overdueCents,
          activitiesToday: counts.today,
          activitiesWeek: counts.week,
        });
        expect(collectionsActivityCounts(activities.filter((row) => ids.includes(row.id)))).toEqual({
          today: 1,
          week: 2,
        });
        matched = true;
      } catch (error) {
        if (attempt === 7) throw error;
      }
    }
    expect(matched).toBe(true);
  });
});
