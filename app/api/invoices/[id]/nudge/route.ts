import { NextResponse } from "next/server";
import { NudgeError, sendNudge } from "@/lib/collections/nudge";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const result = await sendNudge(id);
    return NextResponse.json({
      status: result.status,
      activityId: result.activity.id,
      to: result.to,
      ...(result.reason ? { reason: result.reason } : {}),
    });
  } catch (error) {
    if (error instanceof NudgeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
