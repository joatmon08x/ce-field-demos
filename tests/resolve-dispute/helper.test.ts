import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { resolveDispute } from "@/lib/disputes/resolve";
import { prisma } from "@/lib/prisma";
import { PLAN_PRICE_CENTS } from "@/lib/plans";
import {
  createTddDispute,
  deleteTddDisputes,
  requireSeededScaleInvoice,
  restoreDsp1043,
} from "./harness";

describe("resolve helper (agent 1)", () => {
  beforeAll(async () => {
    await requireSeededScaleInvoice();
  });

  afterEach(async () => {
    await deleteTddDisputes();
    await restoreDsp1043();
  });

  it("caps accept on a $400 Scale claim at $249 and stores the reviewer note", async () => {
    const id = "dsp_tdd_accept";
    await createTddDispute(id, 40_000);

    await resolveDispute({
      disputeId: id,
      action: "accept",
      reviewerNote: "Cap at Scale catalog price.",
    });

    const row = await prisma.dispute.findUniqueOrThrow({ where: { id } });
    expect(row.status).toBe("ACCEPTED");
    expect(row.reviewerNote).toBe("Cap at Scale catalog price.");
    expect(row.suggestedCreditCents).toBe(PLAN_PRICE_CENTS.SCALE);
    expect(row.suggestedCreditCents).not.toBe(40_000);
  });

  it("sets DECLINED and does not raise the stored credit", async () => {
    const id = "dsp_tdd_decline";
    await createTddDispute(id, PLAN_PRICE_CENTS.SCALE);

    await resolveDispute({
      disputeId: id,
      action: "decline",
      reviewerNote: "Leave the invoice standing.",
    });

    const row = await prisma.dispute.findUniqueOrThrow({ where: { id } });
    expect(row.status).toBe("DECLINED");
    expect(row.reviewerNote).toBe("Leave the invoice standing.");
    expect(row.suggestedCreditCents).toBe(PLAN_PRICE_CENTS.SCALE);
  });

  it("throws for a missing dispute id", async () => {
    await expect(
      resolveDispute({ disputeId: "dsp_tdd_missing", action: "decline" }),
    ).rejects.toThrow(/not found/i);
  });
});
