import { NextResponse } from "next/server";
import { getTicket } from "@/lib/companyticket/tickets";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const ticket = getTicket(key);
  if (!ticket) {
    return NextResponse.json({ error: `Ticket not found: ${key}` }, { status: 404 });
  }
  return NextResponse.json(ticket);
}
