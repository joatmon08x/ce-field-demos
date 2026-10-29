import { afterEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/customers/[id]/notes/route";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { getCustomer } from "@/lib/data";
import { NOTE_ACTIVITY_STATUS, NOTE_ADDED } from "@/lib/collection-notes";
import { prisma } from "@/lib/prisma";

const ACCOUNT_ID = "cus_oakiron";
const INVOICE_ID = "inv_1045";
const OTHER_INVOICE_ID = "inv_1043";

function post(id: string, body: unknown) {
  return POST(
    new Request(`http://localhost/api/customers/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  );
}

async function restoreAccount() {
  await prisma.activity.deleteMany({ where: { customerId: ACCOUNT_ID } });
  await prisma.collectionNote.deleteMany({ where: { customerId: ACCOUNT_ID } });
}

describe("save collection note", () => {
  afterEach(restoreAccount);

  it("saves a non-blank note first on the account feed, attributed to Avery Quinn", async () => {
    await prisma.activity.create({
      data: {
        id: "act_older_oakiron",
        customerId: ACCOUNT_ID,
        type: "PAYMENT_RECORDED",
        status: "recorded",
        actorName: DEMO_OPERATOR.name,
        occurredOn: new Date("2020-01-01T00:00:00.000Z"),
      },
    });

    const response = await post(ACCOUNT_ID, {
      body: "  Promise to pay Friday.  ",
      authorName: "Someone Else",
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.note).toMatchObject({
      customerId: ACCOUNT_ID,
      invoiceId: null,
      authorName: DEMO_OPERATOR.name,
      body: "Promise to pay Friday.",
    });
    expect(payload.note.createdAt).toBe(payload.note.updatedAt);
    expect(payload.activity).toMatchObject({
      customerId: ACCOUNT_ID,
      invoiceId: null,
      noteId: payload.note.id,
      type: NOTE_ADDED,
      status: NOTE_ACTIVITY_STATUS,
      actorName: DEMO_OPERATOR.name,
      occurredOn: payload.note.createdAt,
    });

    const account = await getCustomer(ACCOUNT_ID);
    expect(account?.activities[0]).toMatchObject({
      type: NOTE_ADDED,
      actorName: DEMO_OPERATOR.name,
      occurredOn: new Date(payload.note.createdAt),
      note: { body: "Promise to pay Friday." },
    });
    expect(account?.activities[1]?.type).toBe("PAYMENT_RECORDED");

    const stored = await prisma.collectionNote.findUniqueOrThrow({ where: { id: payload.note.id } });
    expect(stored.authorName).toBe(DEMO_OPERATOR.name);
    expect(stored.body).toBe("Promise to pay Friday.");
    expect(await prisma.activity.count({ where: { customerId: ACCOUNT_ID, type: NOTE_ADDED } })).toBe(1);
  });

  it.each(["", "   ", "\n"])(
    "returns 400 for a blank body %j and leaves the feed unchanged",
    async (body) => {
      const saved = await post(ACCOUNT_ID, { body: "Hold the follow-up until Friday." });
      expect(saved.status).toBe(200);
      const notesBefore = await prisma.collectionNote.count({ where: { customerId: ACCOUNT_ID } });
      const activitiesBefore = await prisma.activity.count({ where: { customerId: ACCOUNT_ID } });

      const response = await post(ACCOUNT_ID, { body });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({ error: "Note body is required." });
      expect(await prisma.collectionNote.count({ where: { customerId: ACCOUNT_ID } })).toBe(notesBefore);
      expect(await prisma.activity.count({ where: { customerId: ACCOUNT_ID } })).toBe(activitiesBefore);
    },
  );

  it("returns 400 when the body is missing and stores nothing", async () => {
    const response = await post(ACCOUNT_ID, { invoiceId: INVOICE_ID });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Note body is required." });
    expect(await prisma.collectionNote.count({ where: { customerId: ACCOUNT_ID } })).toBe(0);
    expect(await prisma.activity.count({ where: { customerId: ACCOUNT_ID } })).toBe(0);
  });

  it("ties the note to the invoice when an invoice id is sent", async () => {
    const response = await post(ACCOUNT_ID, {
      body: "Dispute context is on INV-1045.",
      invoiceId: INVOICE_ID,
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.note.invoiceId).toBe(INVOICE_ID);
    expect(payload.activity.invoiceId).toBe(INVOICE_ID);

    const account = await getCustomer(ACCOUNT_ID);
    expect(account?.activities[0]).toMatchObject({
      type: NOTE_ADDED,
      invoiceId: INVOICE_ID,
      invoice: { number: "INV-1045" },
      note: { body: "Dispute context is on INV-1045." },
    });
    const stored = await prisma.collectionNote.findUniqueOrThrow({ where: { id: payload.note.id } });
    expect(stored.invoiceId).toBe(INVOICE_ID);
  });

  it("returns 400 when the invoice is not on the account and stores nothing", async () => {
    const response = await post(ACCOUNT_ID, {
      body: "This invoice belongs to another account.",
      invoiceId: OTHER_INVOICE_ID,
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invoice is not on this account." });
    expect(await prisma.collectionNote.count({ where: { customerId: ACCOUNT_ID } })).toBe(0);
    expect(await prisma.collectionNote.count({ where: { invoiceId: OTHER_INVOICE_ID } })).toBe(0);
    expect(await prisma.activity.count({ where: { customerId: ACCOUNT_ID } })).toBe(0);
  });

  it("returns 404 when the account does not exist", async () => {
    const response = await post("cus_missing", { body: "No such account." });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Account not found." });
    expect(await prisma.collectionNote.count({ where: { authorName: DEMO_OPERATOR.name, body: "No such account." } })).toBe(0);
  });

  it("lists notes newest createdAt first", async () => {
    const older = await post(ACCOUNT_ID, { body: "First call: asked for a copy of the invoice." });
    expect(older.status).toBe(200);
    await new Promise((resolve) => setTimeout(resolve, 5));
    const newer = await post(ACCOUNT_ID, { body: "Second call: promised to pay Friday." });
    expect(newer.status).toBe(200);
    const newerPayload = await newer.json();

    const notes = await prisma.collectionNote.findMany({
      where: { customerId: ACCOUNT_ID },
      orderBy: { createdAt: "desc" },
    });
    expect(notes.map((note) => note.body)).toEqual([
      "Second call: promised to pay Friday.",
      "First call: asked for a copy of the invoice.",
    ]);
    expect(notes[0]?.createdAt.getTime()).toBeGreaterThan(notes[1]!.createdAt.getTime());

    const account = await getCustomer(ACCOUNT_ID);
    expect(account?.activities[0]).toMatchObject({
      type: NOTE_ADDED,
      actorName: DEMO_OPERATOR.name,
      note: { body: "Second call: promised to pay Friday." },
      occurredOn: new Date(newerPayload.note.createdAt),
    });
    expect(account?.activities[1]?.note?.body).toBe("First call: asked for a copy of the invoice.");
  });
});
