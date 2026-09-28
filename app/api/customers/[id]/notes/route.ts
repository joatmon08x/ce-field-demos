import { NextResponse } from "next/server";
import { createNote, NoteError } from "@/lib/collections/notes";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let payload: { body?: unknown; invoiceId?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Note cannot be blank." }, { status: 400 });
  }

  if (payload.invoiceId != null && payload.invoiceId !== "" && typeof payload.invoiceId !== "string") {
    return NextResponse.json(
      { error: "Invoice does not belong to this customer." },
      { status: 400 },
    );
  }

  const body = typeof payload.body === "string" ? payload.body : "";
  const invoiceId = typeof payload.invoiceId === "string" ? payload.invoiceId : undefined;

  try {
    const note = await createNote({ customerId: id, invoiceId, body });
    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    if (error instanceof NoteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
