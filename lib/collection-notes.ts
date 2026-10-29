import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const NOTE_ADDED = "NOTE_ADDED";
export const NOTE_ACTIVITY_STATUS = "saved";

type NoteFailure = { ok: false; status: 400 | 404; error: string };

export async function saveCollectionNote(
  customerId: string,
  input: { body: unknown; invoiceId?: unknown },
) {
  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (!body) {
    return { ok: false as const, status: 400 as const, error: "Note body is required." };
  }

  const invoiceId = readInvoiceId(input.invoiceId);
  if (invoiceId === invalidInvoice) {
    return { ok: false as const, status: 400 as const, error: "Invoice is not on this account." };
  }

  return prisma.$transaction(async (tx): Promise<
    | NoteFailure
    | {
        ok: true;
        note: {
          id: string;
          customerId: string;
          invoiceId: string | null;
          authorName: string;
          body: string;
          createdAt: Date;
          updatedAt: Date;
        };
        activity: {
          id: string;
          customerId: string;
          invoiceId: string | null;
          noteId: string | null;
          type: string;
          status: string;
          actorName: string;
          occurredOn: Date;
        };
      }
  > => {
    const customer = await tx.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });
    if (!customer) {
      return { ok: false, status: 404, error: "Account not found." };
    }

    if (invoiceId) {
      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, customerId },
        select: { id: true },
      });
      if (!invoice) {
        return { ok: false, status: 400, error: "Invoice is not on this account." };
      }
    }

    const savedAt = new Date();
    const note = await tx.collectionNote.create({
      data: {
        id: `note_${crypto.randomUUID()}`,
        customerId,
        invoiceId,
        authorName: DEMO_OPERATOR.name,
        body,
        createdAt: savedAt,
        updatedAt: savedAt,
      },
    });
    const activity = await tx.activity.create({
      data: {
        id: `act_${crypto.randomUUID()}`,
        customerId,
        invoiceId,
        noteId: note.id,
        type: NOTE_ADDED,
        status: NOTE_ACTIVITY_STATUS,
        actorName: DEMO_OPERATOR.name,
        occurredOn: savedAt,
      },
    });

    return { ok: true, note, activity };
  });
}

const invalidInvoice = Symbol("invalid-invoice");

function readInvoiceId(value: unknown): string | null | typeof invalidInvoice {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return invalidInvoice;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}
