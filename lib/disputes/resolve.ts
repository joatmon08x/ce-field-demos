import { suggestDisputeCredit } from "@/lib/dispute-credit";
import { planPriceCents } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export type ResolveDisputeInput = {
  disputeId: string;
  action: "accept" | "decline";
  reviewerNote?: string;
};

/**
 * Persist ACCEPTED or DECLINED. On accept, cap suggested credit at the
 * invoice catalog plan price. Never invent a number above that price.
 */
export async function resolveDispute(input: ResolveDisputeInput) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: input.disputeId },
    include: { invoice: true },
  });

  if (!dispute) {
    throw new Error(`Dispute ${input.disputeId} not found`);
  }

  const reviewerNote = input.reviewerNote ?? dispute.reviewerNote ?? null;

  if (input.action === "decline") {
    return prisma.dispute.update({
      where: { id: dispute.id },
      data: {
        status: "DECLINED",
        reviewerNote,
      },
    });
  }

  const suggestedCreditCents = suggestDisputeCredit({
    disputedAmountCents: dispute.disputedAmountCents,
    planPriceCents: planPriceCents(dispute.invoice.plan),
  });

  return prisma.dispute.update({
    where: { id: dispute.id },
    data: {
      status: "ACCEPTED",
      suggestedCreditCents,
      reviewerNote,
    },
  });
}
