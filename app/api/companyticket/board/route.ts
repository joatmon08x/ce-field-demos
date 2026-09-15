import { NextResponse } from "next/server";
import { listBacklog, listSprintBoard } from "@/lib/companyticket/tickets";

export async function GET() {
  const board = listSprintBoard();
  if (!board) {
    return NextResponse.json({ error: "No active sprint" }, { status: 404 });
  }
  return NextResponse.json({ ...board, backlog: listBacklog() });
}
