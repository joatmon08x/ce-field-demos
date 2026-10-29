import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { saveCollectionNote } from "@/lib/collection-notes";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const input = await readNote(request);
  if (!input) {
    return NextResponse.json({ error: "Note body is required." }, { status: 400 });
  }

  const result = await saveCollectionNote(id, input);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  revalidateNote(id);

  return NextResponse.json({
    note: {
      id: result.note.id,
      customerId: result.note.customerId,
      invoiceId: result.note.invoiceId,
      authorName: result.note.authorName,
      body: result.note.body,
      createdAt: result.note.createdAt.toISOString(),
      updatedAt: result.note.updatedAt.toISOString(),
    },
    activity: {
      id: result.activity.id,
      customerId: result.activity.customerId,
      invoiceId: result.activity.invoiceId,
      noteId: result.activity.noteId,
      type: result.activity.type,
      status: result.activity.status,
      actorName: result.activity.actorName,
      occurredOn: result.activity.occurredOn.toISOString(),
    },
  });
}

async function readNote(request: Request): Promise<{ body: unknown; invoiceId?: unknown } | null> {
  try {
    const payload: unknown = await request.json();
    if (!payload || typeof payload !== "object") return { body: undefined };
    return {
      body: "body" in payload ? payload.body : undefined,
      invoiceId: "invoiceId" in payload ? payload.invoiceId : undefined,
    };
  } catch {
    return null;
  }
}

function revalidateNote(customerId: string) {
  if (process.env.VITEST) return;
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/customers");
}
