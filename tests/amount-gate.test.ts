import { describe, expect, it } from "vitest";
import { AMOUNT_MASK_TEXT } from "@/components/collections/gated-amount";
import { amountsVisible } from "@/lib/plans";

describe("amount gate", () => {
  it("is visible only for Starter, Growth, and Scale", () => {
    expect(amountsVisible("STARTER")).toBe(true);
    expect(amountsVisible("GROWTH")).toBe(true);
    expect(amountsVisible("SCALE")).toBe(true);
    expect(amountsVisible("FREE")).toBe(false);
  });

  it("masks with the upgrade copy", () => {
    expect(AMOUNT_MASK_TEXT).toBe("Upgrade to view amounts");
  });
});
