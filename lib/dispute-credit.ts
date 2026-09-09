/**
 * Suggested credit for a dispute.
 *
 * Never suggest more credit than the catalog plan price
 * ($49 / $99 / $249 in cents).
 */
export function suggestDisputeCredit(input: {
  disputedAmountCents: number;
  planPriceCents: number;
}): number {
  if (input.disputedAmountCents < 0 || input.planPriceCents < 0) {
    throw new Error("Credit inputs must be non-negative cents.");
  }

  return Math.min(input.disputedAmountCents, input.planPriceCents);
}
