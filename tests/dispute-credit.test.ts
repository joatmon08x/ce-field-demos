import { describe, expect, it } from "vitest";
import { suggestDisputeCredit } from "@/lib/dispute-credit";
import { PLAN_PRICE_CENTS } from "@/lib/plans";

describe("suggestDisputeCredit", () => {
  it("never suggests more credit than the invoice plan price", () => {
    const suggested = suggestDisputeCredit({
      disputedAmountCents: 40_000,
      planPriceCents: PLAN_PRICE_CENTS.SCALE,
    });

    expect(suggested).toBe(PLAN_PRICE_CENTS.SCALE);
  });

  it("returns the claim when it is under the plan price", () => {
    expect(
      suggestDisputeCredit({
        disputedAmountCents: PLAN_PRICE_CENTS.STARTER,
        planPriceCents: PLAN_PRICE_CENTS.SCALE,
      }),
    ).toBe(PLAN_PRICE_CENTS.STARTER);
    expect(
      suggestDisputeCredit({
        disputedAmountCents: 0,
        planPriceCents: PLAN_PRICE_CENTS.GROWTH,
      }),
    ).toBe(0);
  });

  it("rejects negative cent inputs", () => {
    expect(() =>
      suggestDisputeCredit({
        disputedAmountCents: -1,
        planPriceCents: PLAN_PRICE_CENTS.GROWTH,
      }),
    ).toThrow(/non-negative/);
    expect(() =>
      suggestDisputeCredit({
        disputedAmountCents: PLAN_PRICE_CENTS.STARTER,
        planPriceCents: -1,
      }),
    ).toThrow(/non-negative/);
  });
});
