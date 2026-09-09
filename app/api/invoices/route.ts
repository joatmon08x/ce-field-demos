import { NextResponse } from "next/server";
import { getInvoices } from "@/lib/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const invoices = await getInvoices({
    status: url.searchParams.get("status") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
  });
  return NextResponse.json({ invoices });
}
