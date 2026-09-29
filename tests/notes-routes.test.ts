import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { POST } from "@/app/api/customers/[id]/notes/route";
import { PATCH } from "@/app/api/notes/[id]/route";
import * as notesById from "@/app/api/notes/[id]/route";
import { prisma } from "@/lib/prisma";

const CUSTOMER_ID = "cus_quarrypine";

const createdNoteIds: string[] = [];
const createdActivityIds: string[] = [];

let ownInvoiceId: string;
let otherInvoiceId: string;

function noteParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

async function trackCustomerDiff(
  customerId: string,
  noteIdsBefore: Set<string>,
  activityIdsBefore: Set<string>,
) {
  const [notes, activities] = await Promise.all([
    prisma.collectionNote.findMany({ where: { customerId }, select: { id: true } }),
    prisma.activity.findMany({ where: { customerId }, select: { id: true } }),
  ]);
  for (const note of notes) {
    if (!noteIdsBefore.has(note.id) && !createdNoteIds.includes(note.id)) {
      createdNoteIds.push(note.id);
    }
  }
  for (const activity of activities) {
    if (!activityIdsBefore.has(activity.id) && !createdActivityIds.includes(activity.id)) {
      createdActivityIds.push(activity.id);
    }
  }
}

async function postNote(customerId: string, body: unknown) {
  const [notesBefore, activitiesBefore] = await Promise.all([
    prisma.collectionNote.findMany({ where: { customerId }, select: { id: true } }),
    prisma.activity.findMany({ where: { customerId }, select: { id: true } }),
  ]);

  const response = await POST(
    new Request(`http://localhost/api/customers/${customerId}/notes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
    noteParams(customerId),
  );

  await trackCustomerDiff(
    customerId,
    new Set(notesBefore.map((note) => note.id)),
    new Set(activitiesBefore.map((activity) => activity.id)),
  );

  return response;
}

function patchNote(id: string, body: unknown) {
  return PATCH(
    new Request(`http://localhost/api/notes/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
    noteParams(id),
  );
}

async function removeCreatedRows() {
  if (createdActivityIds.length > 0) {
    await prisma.activity.deleteMany({ where: { id: { in: [...createdActivityIds] } } });
    createdActivityIds.length = 0;
  }
  if (createdNoteIds.length > 0) {
    await prisma.collectionNote.deleteMany({ where: { id: { in: [...createdNoteIds] } } });
    createdNoteIds.length = 0;
  }
}

beforeAll(async () => {
  const invoice = await prisma.invoice.findFirstOrThrow({
    where: { customerId: CUSTOMER_ID },
  });
  ownInvoiceId = invoice.id;
  const other = await prisma.invoice.findFirstOrThrow({
    where: { customerId: { not: CUSTOMER_ID } },
  });
  otherInvoiceId = other.id;
});

afterEach(async () => {
  await removeCreatedRows();
});

afterAll(async () => {
  await removeCreatedRows();
  await prisma.$disconnect();
});

describe("POST /api/customers/[id]/notes", () => {
  it("stores a note by Avery Quinn and a NOTE_ADDED activity", async () => {
    const text = "Left a voicemail about the open invoice.";
    const response = await postNote(CUSTOMER_ID, { body: text });

    expect(response.status).toBe(201);
    const { note } = await response.json();
    expect(note.authorName).toBe("Avery Quinn");
    expect(note.body).toBe(text);

    const activities = await prisma.activity.findMany({
      where: {
        customerId: CUSTOMER_ID,
        type: "NOTE_ADDED",
        payload: { contains: note.id },
      },
    });
    expect(activities).toHaveLength(1);
    expect(JSON.parse(activities[0].payload)).toMatchObject({ noteId: note.id, body: text });
  });

  it("rejects a blank body and stores nothing", async () => {
    const notesBefore = await prisma.collectionNote.count({ where: { customerId: CUSTOMER_ID } });
    const activitiesBefore = await prisma.activity.count({ where: { customerId: CUSTOMER_ID } });

    const response = await postNote(CUSTOMER_ID, { body: "   " });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Note body is required" });
    expect(await prisma.collectionNote.count({ where: { customerId: CUSTOMER_ID } })).toBe(notesBefore);
    expect(await prisma.activity.count({ where: { customerId: CUSTOMER_ID } })).toBe(activitiesBefore);
  });

  it("stores an invoiceId that belongs to the customer", async () => {
    const response = await postNote(CUSTOMER_ID, {
      body: "Noted against the invoice.",
      invoiceId: ownInvoiceId,
    });

    expect(response.status).toBe(201);
    const { note } = await response.json();
    expect(note.invoiceId).toBe(ownInvoiceId);

    const stored = await prisma.collectionNote.findUniqueOrThrow({ where: { id: note.id } });
    expect(stored.invoiceId).toBe(ownInvoiceId);
  });

  it("rejects an invoice that belongs to another customer", async () => {
    const response = await postNote(CUSTOMER_ID, {
      body: "Wrong invoice.",
      invoiceId: otherInvoiceId,
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invoice does not belong to this customer" });
  });

  it("returns 404 for an unknown customer", async () => {
    const response = await postNote("cus_missing", { body: "Hello" });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Customer not found" });
  });
});

describe("PATCH /api/notes/[id]", () => {
  it("updates a fresh note", async () => {
    const created = await postNote(CUSTOMER_ID, { body: "Original note." });
    const { note } = await created.json();

    const response = await patchNote(note.id, { body: "Updated note." });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.note.body).toBe("Updated note.");

    const stored = await prisma.collectionNote.findUniqueOrThrow({ where: { id: note.id } });
    expect(stored.body).toBe("Updated note.");
  });

  it("rejects an edit after the 15-minute window", async () => {
    const created = await postNote(CUSTOMER_ID, { body: "Still the original." });
    const { note } = await created.json();

    await prisma.collectionNote.update({
      where: { id: note.id },
      data: { createdAt: new Date(Date.now() - 16 * 60_000) },
    });

    const response = await patchNote(note.id, { body: "Too late." });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "Notes can only be edited by their author within 15 minutes",
    });
    const stored = await prisma.collectionNote.findUniqueOrThrow({ where: { id: note.id } });
    expect(stored.body).toBe("Still the original.");
  });

  it("rejects an edit by someone other than the author", async () => {
    const note = await prisma.collectionNote.create({
      data: {
        customerId: CUSTOMER_ID,
        authorName: "Someone Else",
        body: "Not ours.",
      },
    });
    createdNoteIds.push(note.id);

    const response = await patchNote(note.id, { body: "Overwrite." });

    expect(response.status).toBe(403);
    const stored = await prisma.collectionNote.findUniqueOrThrow({ where: { id: note.id } });
    expect(stored.body).toBe("Not ours.");
  });

  it("does not export DELETE", () => {
    expect("DELETE" in notesById).toBe(false);
  });

  it("returns 404 for an unknown note", async () => {
    const response = await patchNote("note_missing", { body: "Hello" });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Note not found" });
  });
});
