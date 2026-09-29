import { NextResponse } from "next/server";
import { DEMO_AS_OF } from "@/lib/clock";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

type NoteCreateBody = {
  body?: unknown;
  invoiceId?: unknown;
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: customerId } = await params;

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  let payload: NoteCreateBody;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    payload = parsed as NoteCreateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof payload.body !== "string" || payload.body.trim() === "") {
    return NextResponse.json({ error: "Note body is required" }, { status: 400 });
  }
  const trimmed = payload.body.trim();

  let invoiceId: string | null = null;
  if (payload.invoiceId !== undefined && payload.invoiceId !== null) {
    if (typeof payload.invoiceId !== "string") {
      return NextResponse.json(
        { error: "Invoice does not belong to this customer" },
        { status: 400 },
      );
    }
    const invoice = await prisma.invoice.findFirst({
      where: { id: payload.invoiceId, customerId },
    });
    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice does not belong to this customer" },
        { status: 400 },
      );
    }
    invoiceId = payload.invoiceId;
  }

  const note = await prisma.$transaction(async (tx) => {
    const created = await tx.collectionNote.create({
      data: {
        customerId,
        invoiceId,
        authorName: DEMO_OPERATOR.name,
        body: trimmed,
      },
    });
    await tx.activity.create({
      data: {
        customerId,
        invoiceId,
        type: "NOTE_ADDED",
        actorName: DEMO_OPERATOR.name,
        status: "recorded",
        payload: JSON.stringify({ noteId: created.id, body: trimmed }),
        occurredOn: DEMO_AS_OF,
      },
    });
    return created;
  });

  return NextResponse.json({ note }, { status: 201 });
}
