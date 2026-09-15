import { NextResponse } from "next/server";
import { listTickets } from "@/lib/companyticket/tickets";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sprintId = url.searchParams.get("sprintId") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const type = url.searchParams.get("type") ?? undefined;
  return NextResponse.json(listTickets({ sprintId, status, type }));
}
