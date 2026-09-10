import { NextResponse } from "next/server";
import { getDispute } from "@/lib/data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dispute = await getDispute(id);
  if (!dispute) {
    return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
  }
  return NextResponse.json({ dispute });
}
