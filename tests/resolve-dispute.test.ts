import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveDispute } from "@/lib/disputes/resolve";
import { PLAN_PRICE_CENTS } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

type DisputeSnapshot = {
  status: string;
  suggestedCreditCents: number;
  reviewerNote: string | null;
};

const TRACKED_IDS = ["dsp_1043", "dsp_1047"] as const;

describe("resolveDispute", () => {
  const snapshots = new Map<string, DisputeSnapshot>();

  beforeEach(async () => {
    for (const id of TRACKED_IDS) {
      const dispute = await prisma.dispute.findUnique({ where: { id } });
      if (!dispute) {
        throw new Error(`Expected seeded dispute ${id}`);
      }
      snapshots.set(id, {
        status: dispute.status,
        suggestedCreditCents: dispute.suggestedCreditCents,
        reviewerNote: dispute.reviewerNote,
      });
    }
  });

  afterEach(async () => {
    for (const id of TRACKED_IDS) {
      const original = snapshots.get(id);
      if (!original) continue;
      await prisma.dispute.update({ where: { id }, data: original });
    }
  });

  it("accepts dsp_1043 and caps credit at the Scale plan price", async () => {
    const result = await resolveDispute({
      disputeId: "dsp_1043",
      action: "accept",
      reviewerNote: "Credit capped at the Scale catalog price.",
    });

    expect(result.status).toBe("ACCEPTED");
    expect(result.suggestedCreditCents).toBe(PLAN_PRICE_CENTS.SCALE);
    expect(result.suggestedCreditCents).toBeLessThan(40_000);
    expect(result.reviewerNote).toBe("Credit capped at the Scale catalog price.");

    const stored = await prisma.dispute.findUnique({ where: { id: "dsp_1043" } });
    expect(stored?.status).toBe("ACCEPTED");
    expect(stored?.suggestedCreditCents).toBe(PLAN_PRICE_CENTS.SCALE);
    expect(stored?.reviewerNote).toBe("Credit capped at the Scale catalog price.");
  });

  it("declines a dispute without changing suggested credit", async () => {
    const before = await prisma.dispute.findUnique({ where: { id: "dsp_1047" } });

    const result = await resolveDispute({
      disputeId: "dsp_1047",
      action: "decline",
      reviewerNote: "Duplicate already reversed on the next invoice.",
    });

    expect(result.status).toBe("DECLINED");
    expect(result.suggestedCreditCents).toBe(before?.suggestedCreditCents);
    expect(result.reviewerNote).toBe("Duplicate already reversed on the next invoice.");

    const stored = await prisma.dispute.findUnique({ where: { id: "dsp_1047" } });
    expect(stored?.status).toBe("DECLINED");
    expect(stored?.suggestedCreditCents).toBe(before?.suggestedCreditCents);
  });

  it("throws when the dispute is missing", async () => {
    await expect(
      resolveDispute({ disputeId: "dsp_missing", action: "decline" }),
    ).rejects.toThrow(/not found/i);
  });
});
