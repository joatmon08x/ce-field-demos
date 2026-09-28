import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/customers/[id]/notes/route";
import { PATCH } from "@/app/api/notes/[id]/route";
import { canEditNote } from "@/lib/collections/notes";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

const CUSTOMER_ID = "cus_quarrypine";
const INVOICE_ID = "inv_1043";

const params = (id: string) => ({ params: Promise.resolve({ id }) });

const createdNoteIds: string[] = [];

function track(noteId: string | undefined) {
  if (noteId) createdNoteIds.push(noteId);
}

afterEach(async () => {
  const ids = createdNoteIds.splice(0);
  if (ids.length === 0) return;

  const activities = await prisma.activity.findMany({
    where: { type: "NOTE_ADDED" },
    select: { id: true, payload: true },
  });
  const activityIds = activities.flatMap((row) => {
    try {
      const payload = JSON.parse(row.payload) as { noteId?: string };
      return payload.noteId && ids.includes(payload.noteId) ? [row.id] : [];
    } catch {
      return [];
    }
  });

  if (activityIds.length > 0) {
    await prisma.activity.deleteMany({ where: { id: { in: activityIds } } });
  }
  await prisma.collectionNote.deleteMany({ where: { id: { in: ids } } });
});

function postNote(customerId: string, body: { body: string; invoiceId?: string }) {
  return POST(
    new Request("http://localhost/api/customers/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    params(customerId),
  );
}

function patchNote(id: string, body: { body: string }) {
  return PATCH(
    new Request("http://localhost/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    params(id),
  );
}

describe("collection notes", () => {
  it("stores a non-blank note by Avery Quinn and one NOTE_ADDED activity", async () => {
    const response = await postNote(CUSTOMER_ID, { body: "Promised to pay the Scale invoice." });
    const json = await response.json();
    track(json.note?.id);

    expect(response.status).toBe(201);
    expect(json.note.authorName).toBe("Avery Quinn");
    expect(json.note.authorName).toBe(DEMO_OPERATOR.name);

    const stored = await prisma.collectionNote.findUnique({ where: { id: json.note.id } });
    expect(stored?.authorName).toBe("Avery Quinn");
    expect(stored?.body).toBe("Promised to pay the Scale invoice.");
    expect(stored?.invoiceId).toBeNull();

    const activities = await prisma.activity.findMany({
      where: { customerId: CUSTOMER_ID, type: "NOTE_ADDED" },
    });
    const matches = activities.filter((row) => {
      const payload = JSON.parse(row.payload) as { noteId?: string };
      return payload.noteId === json.note.id;
    });
    expect(matches).toHaveLength(1);
    expect(JSON.parse(matches[0].payload).noteId).toBe(json.note.id);
    expect(matches[0].status).toBe("recorded");
  });

  it("returns 400 for a blank body and stores nothing", async () => {
    const notesBefore = await prisma.collectionNote.count();
    const activitiesBefore = await prisma.activity.count();

    const response = await postNote(CUSTOMER_ID, { body: "   " });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: expect.any(String) });
    expect(await prisma.collectionNote.count()).toBe(notesBefore);
    expect(await prisma.activity.count()).toBe(activitiesBefore);
  });

  it("ties a note to the customer's invoice and records the invoice number", async () => {
    const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: INVOICE_ID } });
    expect(invoice.customerId).toBe(CUSTOMER_ID);

    const response = await postNote(CUSTOMER_ID, {
      body: "Dispute context for this invoice.",
      invoiceId: invoice.id,
    });
    const json = await response.json();
    track(json.note?.id);

    expect(response.status).toBe(201);
    const stored = await prisma.collectionNote.findUnique({ where: { id: json.note.id } });
    expect(stored?.invoiceId).toBe(invoice.id);

    const activities = await prisma.activity.findMany({
      where: { customerId: CUSTOMER_ID, type: "NOTE_ADDED" },
    });
    const match = activities.find((row) => {
      const payload = JSON.parse(row.payload) as { noteId?: string };
      return payload.noteId === json.note.id;
    });
    expect(match).toBeTruthy();
    expect(JSON.parse(match!.payload).invoiceNumber).toBe(invoice.number);
  });

  it("returns 400 when the invoice belongs to another customer", async () => {
    const other = await prisma.invoice.findFirstOrThrow({
      where: { customerId: { not: CUSTOMER_ID } },
    });
    const notesBefore = await prisma.collectionNote.count();
    const activitiesBefore = await prisma.activity.count();

    const response = await postNote(CUSTOMER_ID, {
      body: "This invoice is on another account.",
      invoiceId: other.id,
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: expect.any(String) });
    expect(await prisma.collectionNote.count()).toBe(notesBefore);
    expect(await prisma.activity.count()).toBe(activitiesBefore);
  });

  it("updates the body when the note is still inside the edit window", async () => {
    const created = await postNote(CUSTOMER_ID, { body: "Promised to pay the Scale invoice." });
    const createdJson = await created.json();
    track(createdJson.note?.id);
    expect(created.status).toBe(201);

    const response = await patchNote(createdJson.note.id, { body: "Corrected promise to pay." });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.note.body).toBe("Corrected promise to pay.");
    const stored = await prisma.collectionNote.findUnique({ where: { id: createdJson.note.id } });
    expect(stored?.body).toBe("Corrected promise to pay.");
  });

  it("returns 403 and leaves the body unchanged after 15 minutes", async () => {
    const note = await prisma.collectionNote.create({
      data: {
        id: `note_${randomUUID()}`,
        customerId: CUSTOMER_ID,
        authorName: DEMO_OPERATOR.name,
        body: "Original note body.",
        createdAt: new Date(Date.now() - 16 * 60 * 1000),
      },
    });
    track(note.id);

    const response = await patchNote(note.id, { body: "Should not stick." });

    expect(response.status).toBe(403);
    const stored = await prisma.collectionNote.findUnique({ where: { id: note.id } });
    expect(stored?.body).toBe("Original note body.");
  });

  it("refuses an edit for a different author inside the window", () => {
    const now = new Date();
    expect(
      canEditNote(
        { authorName: "not-avery", createdAt: new Date(now.getTime() - 60_000) },
        DEMO_OPERATOR.name,
        now,
      ),
    ).toBe(false);
  });
});
