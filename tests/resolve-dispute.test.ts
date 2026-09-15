import { afterEach, describe, expect, it } from "vitest";
import { resolveDispute } from "@/lib/disputes/resolve";
import { prisma } from "@/lib/prisma";
import { PLAN_PRICE_CENTS } from "@/lib/plans";

async function snapshot(id: string) {
  const row = await prisma.dispute.findUniqueOrThrow({ where: { id } });
  return {
    id: row.id,
    status: row.status,
    suggestedCreditCents: row.suggestedCreditCents,
    reviewerNote: row.reviewerNote,
  };
}

describe("resolveDispute", () => {
  const originals: Awaited<ReturnType<typeof snapshot>>[] = [];

  afterEach(async () => {
    for (const row of originals) {
      await prisma.dispute.update({
        where: { id: row.id },
        data: {
          status: row.status,
          suggestedCreditCents: row.suggestedCreditCents,
          reviewerNote: row.reviewerNote,
        },
      });
    }
    originals.length = 0;
  });

  it("caps accepted credit at the catalog plan price and persists ACCEPTED", async () => {
    originals.push(await snapshot("dsp_1043"));
    await prisma.dispute.update({
      where: { id: "dsp_1043" },
      data: { suggestedCreditCents: 40_000 },
    });

    const accepted = await resolveDispute({
      disputeId: "dsp_1043",
      action: "accept",
      reviewerNote: "  Cap at Scale catalog price.  ",
    });

    expect(accepted.status).toBe("ACCEPTED");
    expect(accepted.suggestedCreditCents).toBe(PLAN_PRICE_CENTS.SCALE);
    expect(accepted.suggestedCreditCents).toBeLessThan(40_000);
    expect(accepted.reviewerNote).toBe("Cap at Scale catalog price.");

    const stored = await prisma.dispute.findUniqueOrThrow({ where: { id: "dsp_1043" } });
    expect(stored.status).toBe("ACCEPTED");
    expect(stored.suggestedCreditCents).toBe(PLAN_PRICE_CENTS.SCALE);
    expect(stored.reviewerNote).toBe("Cap at Scale catalog price.");
  });

  it("persists DECLINED without changing suggested credit", async () => {
    originals.push(await snapshot("dsp_1047"));
    const before = originals[0];

    const declined = await resolveDispute({
      disputeId: "dsp_1047",
      action: "decline",
      reviewerNote: "Hold the duplicate-charge claim.",
    });

    expect(declined.status).toBe("DECLINED");
    expect(declined.suggestedCreditCents).toBe(before.suggestedCreditCents);
    expect(declined.reviewerNote).toBe("Hold the duplicate-charge claim.");
  });

  it("throws when the dispute is missing", async () => {
    await expect(
      resolveDispute({ disputeId: "dsp_missing", action: "accept" }),
    ).rejects.toThrow(/dsp_missing/);
  });
});
