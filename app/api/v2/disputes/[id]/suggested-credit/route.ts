import { NextResponse } from "next/server";
import { getDispute } from "@/lib/data";
import { suggestDisputeCredit } from "@/lib/dispute-credit";
import { isPlanId, planPriceCents } from "@/lib/plans";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const dispute = await getDispute(id);
  if (!dispute) {
    return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
  }
  if (!isPlanId(dispute.invoice.plan)) {
    return NextResponse.json({ error: "Dispute invoice has an invalid plan" }, { status: 422 });
  }

  return NextResponse.json({
    disputeId: dispute.id,
    suggestedCreditCents: suggestDisputeCredit({
      disputedAmountCents: dispute.disputedAmountCents,
      planPriceCents: planPriceCents(dispute.invoice.plan),
    }),
    apiVersion: "v2",
  });
}
