/**
 * Regression cover for the v2 migration.
 *
 * The client still selects the deprecated v1 endpoint, so this fails until the
 * call site moves to v2. Keep the legacy route available for compatibility.
 */
import { describe, expect, it } from "vitest";
import { suggestedCreditPath } from "@/lib/disputes/suggested-credit-api";

describe("suggested credit API client", () => {
  it("uses the current API version", () => {
    expect(suggestedCreditPath("dsp_1043")).toBe(
      "/api/v2/disputes/dsp_1043/suggested-credit",
    );
  });
});
