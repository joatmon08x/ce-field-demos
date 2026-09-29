import { NextResponse } from "next/server";
import { canEditNote } from "@/lib/collections";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const existing = await prisma.collectionNote.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  let payload: { body?: unknown };
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    payload = parsed as { body?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof payload.body !== "string" || payload.body.trim() === "") {
    return NextResponse.json({ error: "Note body is required" }, { status: 400 });
  }

  if (!canEditNote(existing)) {
    return NextResponse.json(
      { error: "Notes can only be edited by their author within 15 minutes" },
      { status: 403 },
    );
  }

  const note = await prisma.collectionNote.update({
    where: { id },
    data: { body: payload.body.trim() },
  });

  return NextResponse.json({ note });
}
