import { describe, expect, it } from "vitest";
import {
  BRAND_IDS,
  BRAND_PROFILES,
  getActiveBrand,
  parseStartPrompt,
} from "@/lib/brand";
import { PLAN_PRICE_CENTS } from "@/lib/plans";

describe("vertical brands", () => {
  it("ships exactly three ly companies and a code-only switch", () => {
    expect(BRAND_IDS).toEqual(["clinicly", "saasly", "packetly"]);
    expect(getActiveBrand().id).toBe("saasly");
    expect(getActiveBrand().productName.endsWith("ly")).toBe(true);
  });

  it("parses presenter start prompts", () => {
    expect(parseStartPrompt("Start the Clinicly application")).toBe("clinicly");
    expect(parseStartPrompt("start the PACKETLY application")).toBe("packetly");
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
});
