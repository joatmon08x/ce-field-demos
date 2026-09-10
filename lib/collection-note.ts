import { planLabel, type PlanId } from "@/lib/plans";

/**
 * First-draft dunning copy. Intentionally unfinished — Tab / Cmd-K seam.
 * Never insert a dollar amount here. Plans speak in names; prices live in the catalog.
 */
export function draftCollectionNote(input: {
  customerName: string;
  daysPastDue: number;
  plan: PlanId;
}): string {
  // TODO(tab): finish this sentence with days past due and a request to confirm the ${planLabel(input.plan)} plan. Do not invent a price.
  return `Hi ${input.customerName}, your ${planLabel(input.plan)} invoice is`;
}
