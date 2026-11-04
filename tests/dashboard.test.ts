import { describe, expect, it } from "vitest";
import {
  catalogMrrCents,
  collectedCents,
  disputeCentsAt,
  openCentsAt,
  percentChange,
  revenueSeries,
} from "@/lib/dashboard";

const noon = (isoDate: string) => new Date(`${isoDate}T12:00:00.000Z`);

function invoice(overrides: {
  status?: string;
  issuedOn?: Date;
  paidOn?: Date | null;
  totalCents?: number;
}) {
  return {
    status: "OPEN",
    issuedOn: noon("2026-08-01"),
    paidOn: null as Date | null,
    totalCents: 4900,
    ...overrides,
  };
}

function dispute(overrides: { status?: string; openedOn?: Date; disputedAmountCents?: number }) {
  return {
    status: "OPEN",
    openedOn: noon("2026-08-01"),
    disputedAmountCents: 4900,
    ...overrides,
  };
}

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

  it("treats two empty periods as flat", () => {
    expect(percentChange(0, 0)).toBe(0);
  });
});

describe("openCentsAt", () => {
  const asOf = noon("2026-08-23");

  it("keeps unpaid issued balances and drops drafts, voids, future issues, and payments already on the books", () => {
    const open = openCentsAt(
      [
        invoice({ status: "OVERDUE", totalCents: 9900 }),
        invoice({ status: "OPEN", totalCents: 4900 }),
        invoice({ status: "PAID", paidOn: noon("2026-08-24"), totalCents: 24900 }),
        invoice({ status: "DRAFT", totalCents: 4900 }),
        invoice({ status: "VOID", totalCents: 9900 }),
        invoice({ status: "OPEN", issuedOn: noon("2026-08-24"), totalCents: 24900 }),
        invoice({ status: "PAID", paidOn: noon("2026-08-23"), totalCents: 4900 }),
        invoice({ status: "OPEN", paidOn: noon("2026-08-22"), totalCents: 9900 }),
        invoice({ status: "PAID", paidOn: null, totalCents: 24900 }),
      ],
      asOf,
    );

    expect(open).toBe(9900 + 4900 + 24900 + 24900);
  });
});

describe("collectedCents", () => {
  const start = noon("2026-07-24");
  const end = noon("2026-08-23");

  it("sums PAID invoices whose paidOn sits inside the window, including both ends", () => {
    const collected = collectedCents(
      [
        invoice({ status: "PAID", paidOn: start, totalCents: 4900 }),
        invoice({ status: "PAID", paidOn: end, totalCents: 9900 }),
        invoice({ status: "PAID", paidOn: noon("2026-07-23"), totalCents: 24900 }),
        invoice({ status: "PAID", paidOn: noon("2026-08-24"), totalCents: 24900 }),
        invoice({ status: "OPEN", paidOn: noon("2026-08-01"), totalCents: 4900 }),
        invoice({ status: "PAID", paidOn: null, totalCents: 9900 }),
      ],
      start,
      end,
    );

    expect(collected).toBe(4900 + 9900);
  });
});

describe("disputeCentsAt", () => {
  const asOf = noon("2026-08-23");

  it("counts open and needs-review disputes opened by the as-of date", () => {
    const exposure = disputeCentsAt(
      [
        dispute({ status: "OPEN", disputedAmountCents: 4900 }),
        dispute({ status: "NEEDS_REVIEW", openedOn: asOf, disputedAmountCents: 9900 }),
        dispute({ status: "OPEN", openedOn: noon("2026-08-24"), disputedAmountCents: 24900 }),
        dispute({ status: "ACCEPTED", disputedAmountCents: 24900 }),
        dispute({ status: "DECLINED", disputedAmountCents: 4900 }),
      ],
      asOf,
    );

    expect(exposure).toBe(4900 + 9900);
  });
});

describe("revenueSeries", () => {
  it("accumulates paid cents on the first noon point at or after paidOn", () => {
    const start = noon("2026-08-01");
    const end = noon("2026-08-03");
    const series = revenueSeries(
      [
        invoice({ status: "PAID", paidOn: noon("2026-08-01"), totalCents: 4900 }),
        invoice({
          status: "PAID",
          paidOn: new Date("2026-08-01T18:00:00.000Z"),
          totalCents: 9900,
        }),
        invoice({ status: "PAID", paidOn: noon("2026-08-03"), totalCents: 24900 }),
        invoice({ status: "OPEN", paidOn: noon("2026-08-02"), totalCents: 4900 }),
        invoice({ status: "PAID", paidOn: noon("2026-07-31"), totalCents: 9900 }),
      ],
      start,
      end,
    );

    expect(series).toEqual([
      { date: "2026-08-01", cents: 4900 },
      { date: "2026-08-02", cents: 4900 + 9900 },
      { date: "2026-08-03", cents: 4900 + 9900 + 24900 },
    ]);
  });
});
