import { NextResponse } from "next/server";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { NoteError, updateNoteBody } from "@/lib/collections/notes";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let payload: { body?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Note cannot be blank." }, { status: 400 });
  }

  const body = typeof payload.body === "string" ? payload.body : "";

  try {
    const note = await updateNoteBody(id, body, DEMO_OPERATOR.name);
    return NextResponse.json({ note }, { status: 200 });
  } catch (error) {
    if (error instanceof NoteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
