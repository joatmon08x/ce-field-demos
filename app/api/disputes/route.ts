import { NextResponse } from "next/server";
import { getDisputes } from "@/lib/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const disputes = await getDisputes({
    status: url.searchParams.get("status") ?? undefined,
  });
  return NextResponse.json({ disputes });
}
