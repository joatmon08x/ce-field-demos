import { planPriceCents } from "@/lib/plans";
import { suggestDisputeCredit } from "@/lib/dispute-credit";

export type ResolveDisputeInput = {
  disputeId: string;
  action: "accept" | "decline";
  reviewerNote?: string;
};

/**
 * Multi-file Agent seam.
 * Wire this helper from `app/api/disputes/[id]/resolve/route.ts`
 * and the unfinished panel on `app/disputes/[id]/page.tsx`.
 *
 * When you implement it: persist status, and if accepting a credit,
 * cap it with the catalog plan price. Never invent a number.
 */
export async function resolveDispute(input: ResolveDisputeInput): Promise<never> {
  // TODO(agent): load the dispute + invoice, cap credit with suggestDisputeCredit + planPriceCents, persist ACCEPTED or DECLINED.
  void input;
  void planPriceCents;
  void suggestDisputeCredit;
  throw new Error("resolveDispute is not implemented");
}
