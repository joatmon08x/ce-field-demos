import { randomUUID } from "node:crypto";
import { recordActivity } from "@/lib/collections/activity";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const NOTE_EDIT_WINDOW_MS = 15 * 60 * 1000;

export class NoteError extends Error {
  readonly status: 400 | 403 | 404;

  constructor(message: string, status: 400 | 403 | 404) {
    super(message);
    this.name = "NoteError";
    this.status = status;
  }
}

export function canEditNote(
  note: { authorName: string; createdAt: Date },
  actorName: string,
  now: Date = new Date(),
): boolean {
  if (note.authorName !== actorName) return false;
  return now.getTime() - note.createdAt.getTime() < NOTE_EDIT_WINDOW_MS;
}

function trimmedBody(body: string): string {
  return typeof body === "string" ? body.trim() : "";
}

export async function createNote(input: {
  customerId: string;
  invoiceId?: string | null;
  body: string;
}) {
  const body = trimmedBody(input.body);
  if (!body) {
    throw new NoteError("Note cannot be blank.", 400);
  }

  const customer = await prisma.customer.findUnique({
    where: { id: input.customerId },
    select: { id: true },
  });
  if (!customer) {
    throw new NoteError("Customer not found.", 404);
  }

  const invoiceId = input.invoiceId?.trim() || null;
  let invoiceNumber: string | undefined;
  if (invoiceId) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { customerId: true, number: true },
    });
    if (!invoice || invoice.customerId !== input.customerId) {
      throw new NoteError("Invoice does not belong to this customer.", 400);
    }
    invoiceNumber = invoice.number;
  }

  return prisma.$transaction(async (tx) => {
    const note = await tx.collectionNote.create({
      data: {
        id: `note_${randomUUID()}`,
        customerId: input.customerId,
        invoiceId,
        authorName: DEMO_OPERATOR.name,
        body,
      },
    });

    await recordActivity(
      {
        customerId: input.customerId,
        invoiceId,
        type: "NOTE_ADDED",
        status: "recorded",
        payload: {
          noteId: note.id,
          body,
          ...(invoiceNumber ? { invoiceNumber } : {}),
        },
      },
      tx,
    );

    return note;
  });
}

export async function updateNoteBody(
  id: string,
  body: string,
  actorName: string,
  now: Date = new Date(),
) {
  const note = await prisma.collectionNote.findUnique({ where: { id } });
  if (!note) {
    throw new NoteError("Note not found.", 404);
  }
  if (!canEditNote(note, actorName, now)) {
    throw new NoteError("This note can no longer be edited.", 403);
  }

  const nextBody = trimmedBody(body);
  if (!nextBody) {
    throw new NoteError("Note cannot be blank.", 400);
  }

  return prisma.collectionNote.update({
    where: { id },
    data: { body: nextBody },
  });
}
