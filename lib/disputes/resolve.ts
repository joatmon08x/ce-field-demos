import { suggestDisputeCredit } from "@/lib/dispute-credit";
import { prisma } from "@/lib/prisma";
import { planPriceCents } from "@/lib/plans";

export type ResolveDisputeInput = {
  disputeId: string;
  action: "accept" | "decline";
  reviewerNote?: string;
};

/**
 * Persist a dispute decision. Accepting a credit caps the amount at the
 * catalog plan price via suggestDisputeCredit + planPriceCents.
 *
 * Wire this helper from `app/api/disputes/[id]/resolve/route.ts`
 * and the unfinished panel on `app/disputes/[id]/page.tsx`.
 */
export async function resolveDispute(input: ResolveDisputeInput) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: input.disputeId },
    include: { invoice: true },
  });

  if (!dispute) {
    throw new Error(`Dispute ${input.disputeId} not found.`);
  }

  const reviewerNote =
    input.reviewerNote === undefined ? undefined : input.reviewerNote.trim() || null;

  if (input.action === "decline") {
    return prisma.dispute.update({
      where: { id: dispute.id },
      data: {
        status: "DECLINED",
        ...(reviewerNote !== undefined ? { reviewerNote } : {}),
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
      ...(reviewerNote !== undefined ? { reviewerNote } : {}),
    },
  });
}
