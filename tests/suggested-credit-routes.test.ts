import { describe, expect, it } from "vitest";
import { GET as getLegacySuggestedCredit } from "@/app/api/v1/disputes/[id]/suggested-credit/route";
import { GET as getCurrentSuggestedCredit } from "@/app/api/v2/disputes/[id]/suggested-credit/route";
import { PLAN_PRICE_CENTS } from "@/lib/plans";

const request = new Request("http://localhost/api/suggested-credit");
const params = (id: string) => ({ params: Promise.resolve({ id }) });

describe("suggested credit API versions", () => {
  it("preserves the deprecated v1 response for compatibility", async () => {
    const response = await getLegacySuggestedCredit(request, params("dsp_1043"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Deprecation")).toBe("true");
    expect(body).toMatchObject({
      disputeId: "dsp_1043",
      suggestedCreditCents: 40_000,
      apiVersion: "v1",
    });
  });

  it("caps the v2 response at the catalog price", async () => {
    const response = await getCurrentSuggestedCredit(request, params("dsp_1043"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      disputeId: "dsp_1043",
      suggestedCreditCents: PLAN_PRICE_CENTS.SCALE,
      apiVersion: "v2",
    });
  });

  it.each([getLegacySuggestedCredit, getCurrentSuggestedCredit])(
    "returns 404 for a missing dispute",
    async (handler) => {
      const response = await handler(request, params("dsp_missing"));

      expect(response.status).toBe(404);
      await expect(response.json()).resolves.toEqual({ error: "Dispute not found" });
    },
  );
});
