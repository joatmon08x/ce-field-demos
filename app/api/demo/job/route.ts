import { NextResponse } from "next/server";

/**
 * Local invoice-backfill stand-in for /loop demos. In-memory only — nothing
 * is written to SQLite. POST starts (or restarts) the job; GET reports
 * idle → running → complete over DURATION_MS.
 */

const DURATION_MS = 45_000;
const JOB_ID = "job_invoice_backfill";

let startedAtMs: number | null = null;

function snapshot() {
  if (startedAtMs == null) {
    return {
      id: JOB_ID,
      status: "idle" as const,
      startedAt: null,
      completesAt: null,
      elapsedMs: 0,
      remainingMs: DURATION_MS,
    };
  }
  const completesAtMs = startedAtMs + DURATION_MS;
  const now = Date.now();
  const done = now >= completesAtMs;
  return {
    id: JOB_ID,
    status: done ? ("complete" as const) : ("running" as const),
    startedAt: new Date(startedAtMs).toISOString(),
    completesAt: new Date(completesAtMs).toISOString(),
    elapsedMs: Math.min(now - startedAtMs, DURATION_MS),
    remainingMs: done ? 0 : completesAtMs - now,
  };
}

export async function GET() {
  return NextResponse.json(snapshot());
}

export async function POST() {
  startedAtMs = Date.now();
  return NextResponse.json(snapshot(), { status: 201 });
}
