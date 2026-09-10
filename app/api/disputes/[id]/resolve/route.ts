import { NextResponse } from "next/server";
import { resolveDispute } from "@/lib/disputes/resolve";

/**
 * Agent seam. Should accept { action: "accept" | "decline", reviewerNote?: string }
 * and persist via resolveDispute. Returns 501 until that helper is implemented.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: { action?: string; reviewerNote?: string } = {};
  try {
    body = (await request.json()) as { action?: string; reviewerNote?: string };
  } catch {
    body = {};
  }

  if (body.action !== "accept" && body.action !== "decline") {
    return NextResponse.json(
      { error: "action must be accept or decline" },
      { status: 400 },
    );
  }

  try {
    await resolveDispute({
      disputeId: id,
      action: body.action,
      reviewerNote: body.reviewerNote,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Not implemented";
    return NextResponse.json(
      {
        error: message,
        hint: "Implement lib/disputes/resolve.ts and enable the panel on app/disputes/[id]/page.tsx.",
      },
      { status: 501 },
    );
  }
}
