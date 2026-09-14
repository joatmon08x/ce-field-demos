import { describe, expect, it } from "vitest";
import {
  ACTIVE_BRAND_ID,
  BRAND_IDS,
  BRAND_PROFILES,
  getActiveBrand,
  parseStartPrompt,
} from "@/lib/brand";
import { PLAN_PRICE_CENTS } from "@/lib/plans";

describe("vertical brands", () => {
  it("ships exactly three ly companies and a code-only switch", () => {
    expect(BRAND_IDS).toEqual(["medly", "saasly", "routerly"]);
    expect(BRAND_IDS).toContain(ACTIVE_BRAND_ID);
    expect(getActiveBrand()).toBe(BRAND_PROFILES[ACTIVE_BRAND_ID]);
    expect(getActiveBrand().productName.endsWith("ly")).toBe(true);
  });

  it("parses presenter start prompts", () => {
    expect(parseStartPrompt("Start the Medly application")).toBe("medly");
    expect(parseStartPrompt("start the ROUTERLY application")).toBe("routerly");
    expect(parseStartPrompt("Start SaaSly")).toBe("saasly");
    expect(parseStartPrompt("Start the demo")).toBeNull();
  });

  it("keeps catalog prices and seed ids stable across profiles", () => {
    for (const id of BRAND_IDS) {
      const brand = BRAND_PROFILES[id];
      expect(brand.productName.endsWith("ly")).toBe(true);
      expect(brand.customers).toHaveLength(10);
      expect(brand.extraAccounts).toHaveLength(14);
      expect(brand.customers.map((row) => row.id)).toEqual(BRAND_PROFILES.saasly.customers.map((row) => row.id));
      expect(brand.disputeCopy.dsp_1043).toBeDefined();
      expect(Object.values(PLAN_PRICE_CENTS)).toEqual([4900, 9900, 24900]);
    }
  });

  it("does not use real vendors or health systems", () => {
    const blob = JSON.stringify(BRAND_PROFILES).toLowerCase();
    for (const banned of ["cisco", "juniper networks", "mayo", "kaiser", "cleveland clinic"]) {
      expect(blob).not.toContain(banned);
    }
  });

  it("frames Routerly as a general networking company", () => {
    const routerly = BRAND_PROFILES.routerly;
    const visibleCopy = [
      routerly.industry,
      routerly.operatorRole,
      routerly.tagline,
      ...Object.values(routerly.copy).filter((value) => typeof value === "string"),
      routerly.copy.lineItem("Growth"),
      routerly.copy.extraInvoiceMemo({
        planLabel: "Growth",
        customerName: routerly.customers[0].name,
      }),
      ...Object.values(routerly.invoiceMemos),
      ...Object.values(routerly.disputeCopy).flatMap((copy) => [
        copy.reason,
        copy.reviewerNote ?? "",
      ]),
      ...routerly.customers.map((customer) => customer.name),
      ...routerly.extraAccounts.map((customer) => customer.name),
    ].join(" ");

    expect(routerly.industry).toBe("networking");
    expect(routerly.tagline).toBe("Billing operations for a fictional networking company.");
    expect(visibleCopy).toContain("network service");
    expect(visibleCopy).not.toMatch(/\b(cisco|juniper|routers?|switches?|vendor)\b/i);
  });
});
