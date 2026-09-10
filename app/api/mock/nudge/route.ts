import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * Mock Nudge — Ledgerly's dunning/reminder service. Deterministic,
 * side-effect-free, offline. A local stand-in for /multitask and /loop demos.
 */

export async function GET() {
  return NextResponse.json({
    service: "nudge",
    description: "Ledgerly dunning and reminder service (mock)",
    status: "ready",
    accepts: "POST { ticket_id, action, ...details }",
  });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { service: "nudge", status: "rejected", error: "body must be JSON" },
      { status: 400 },
    );
  }
  const ticketId = body.ticket_id;
  if (typeof ticketId !== "string" || !ticketId.trim()) {
    return NextResponse.json(
      { service: "nudge", status: "rejected", error: "ticket_id (string) is required" },
      { status: 422 },
    );
  }
  const requestId = `REQ-N${createHash("sha256").update(`nudge:${ticketId}`).digest("hex").slice(0, 8).toUpperCase()}`;
  return NextResponse.json({
    service: "nudge",
    status: "ok",
    request_id: requestId,
    ticket_id: ticketId,
    action: typeof body.action === "string" ? body.action : "recorded",
    note: "Mock downstream — deterministic ack, nothing persisted.",
  });
}
