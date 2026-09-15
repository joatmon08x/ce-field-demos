import { NextResponse } from "next/server";
import { resolveDispute } from "@/lib/disputes/resolve";

type ResolveAction = "accept" | "decline";

function isResolveAction(value: unknown): value is ResolveAction {
  return value === "accept" || value === "decline";
}

function statusForResolveError(error: unknown): number {
  const message = error instanceof Error ? error.message : "";
  if (/not implemented/i.test(message)) return 501;
  if (/not found/i.test(message)) return 404;
  if (/invalid|must be|required/i.test(message)) return 400;
  return 500;
}

/**
 * Agent seam. Accepts { action: "accept" | "decline", reviewerNote?: string }
 * and persists via resolveDispute. 501 only when that helper is not implemented.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: { action?: string; reviewerNote?: string } = {};
  try {
    body = (await request.json()) as { action?: string; reviewerNote?: string };
  } catch {
    body = {};
  }

  if (!isResolveAction(body.action)) {
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
    const message = error instanceof Error ? error.message : "Resolve failed";
    const status = statusForResolveError(error);
    return NextResponse.json(
      status === 501
        ? {
            error: message,
            hint: "Implement lib/disputes/resolve.ts and enable the panel on app/disputes/[id]/page.tsx.",
          }
        : { error: message },
      { status },
    );
  }
}
