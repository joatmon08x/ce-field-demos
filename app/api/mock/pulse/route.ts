import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * Mock Pulse — Ledgerly's account-health and reliability signal service.
 * Deterministic, side-effect-free, offline. A local stand-in for /multitask
 * and /loop demos.
 */

export async function GET() {
  return NextResponse.json({
    service: "pulse",
    description: "Ledgerly account-health and reliability signals (mock)",
    status: "ready",
    accepts: "POST { ticket_id, signal, ...details }",
  });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { service: "pulse", status: "rejected", error: "body must be JSON" },
      { status: 400 },
    );
  }
  const ticketId = body.ticket_id;
  if (typeof ticketId !== "string" || !ticketId.trim()) {
    return NextResponse.json(
      { service: "pulse", status: "rejected", error: "ticket_id (string) is required" },
      { status: 422 },
    );
  }
  const requestId = `REQ-P${createHash("sha256").update(`pulse:${ticketId}`).digest("hex").slice(0, 8).toUpperCase()}`;
  return NextResponse.json({
    service: "pulse",
    status: "ok",
    request_id: requestId,
    ticket_id: ticketId,
    signal: typeof body.signal === "string" ? body.signal : "recorded",
    note: "Mock downstream — deterministic ack, nothing persisted.",
  });
}
