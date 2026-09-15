import { NextResponse } from "next/server";
import { listSprints } from "@/lib/companyticket/tickets";

export async function GET() {
  return NextResponse.json(listSprints());
}
