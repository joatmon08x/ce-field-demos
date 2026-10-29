import { afterEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/invoices/[id]/nudge/route";
import { DEMO_AS_OF } from "@/lib/clock";
import { formatDate } from "@/lib/dates";
import { getCustomer } from "@/lib/data";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { formatUsd } from "@/lib/money";
import {
  NUDGE_CHANNEL_EMAIL,
  NUDGE_SENT,
  NUDGE_STATUS_SENT,
  clearRecordedNudges,
  nudgeTemplate,
  recordedNudges,
  sendInvoiceNudge,
} from "@/lib/nudge";
import { outstandingCents } from "@/lib/overdue-book";
import { PLAN_PRICE_CENTS } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

const OVERDUE_INVOICE_ID = "inv_1043";
const OPEN_INVOICE_ID = "inv_1041";
const COBALT_CUSTOMER_ID = "cus_quarrypine";
const COBALT_EMAIL = "accounts@cobaltgoods.example";

function post(id: string, body?: unknown) {
  return POST(
    new Request(`http://localhost/api/invoices/${id}/nudge`, {
      method: "POST",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  );
}

async function restoreCobalt() {
  await prisma.activity.deleteMany({ where: { invoiceId: OVERDUE_INVOICE_ID } });
  await prisma.customer.update({
    where: { id: COBALT_CUSTOMER_ID },
    data: { email: COBALT_EMAIL },
  });
  clearRecordedNudges();
}

describe("send nudge", () => {
  afterEach(restoreCobalt);

  it("emails the on-file address and logs NUDGE_SENT on the account", async () => {
    const response = await post(OVERDUE_INVOICE_ID);
    const payload = await response.json();

    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: OVERDUE_INVOICE_ID },
      include: { payments: true, customer: true },
    });
    const template = nudgeTemplate(invoice);

    expect(response.status).toBe(200);
    expect(payload.activity).toMatchObject({
      customerId: COBALT_CUSTOMER_ID,
      invoiceId: OVERDUE_INVOICE_ID,
      type: NUDGE_SENT,
      status: NUDGE_STATUS_SENT,
      channel: NUDGE_CHANNEL_EMAIL,
      body: template,
      amountCents: PLAN_PRICE_CENTS.SCALE,
      actorName: DEMO_OPERATOR.name,
      occurredOn: DEMO_AS_OF.toISOString(),
      to: COBALT_EMAIL,
    });
    expect(template).toContain(invoice.number);
    expect(template).toContain(formatUsd(outstandingCents(invoice)));
    expect(template).toContain(formatDate(invoice.dueOn));
    expect(formatUsd(outstandingCents(invoice))).toBe("$249.00");

    expect(recordedNudges()).toEqual([
      {
        to: COBALT_EMAIL,
        channel: NUDGE_CHANNEL_EMAIL,
        subject: `Reminder for ${invoice.number}`,
        body: template,
        invoiceId: OVERDUE_INVOICE_ID,
      },
    ]);

    const account = await getCustomer(COBALT_CUSTOMER_ID);
    expect(account?.activities[0]).toMatchObject({
      type: NUDGE_SENT,
      status: NUDGE_STATUS_SENT,
      channel: NUDGE_CHANNEL_EMAIL,
      body: template,
      actorName: DEMO_OPERATOR.name,
      amountCents: PLAN_PRICE_CENTS.SCALE,
      invoice: { number: invoice.number },
    });
    expect(invoice.status).toBe("OVERDUE");
  });

  it("keeps the fixed template when the request includes a body", async () => {
    const response = await post(OVERDUE_INVOICE_ID, { body: "Please pay this week.", channel: "sms" });
    const payload = await response.json();
    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: OVERDUE_INVOICE_ID },
      include: { payments: true },
    });

    expect(response.status).toBe(200);
    expect(payload.activity.body).toBe(nudgeTemplate(invoice));
    expect(payload.activity.channel).toBe(NUDGE_CHANNEL_EMAIL);
    expect(payload.activity.body).not.toContain("Please pay this week.");
    expect(recordedNudges()[0]?.channel).toBe(NUDGE_CHANNEL_EMAIL);
  });

  it("appends another NUDGE_SENT each time a nudge is sent", async () => {
    const first = await post(OVERDUE_INVOICE_ID);
    const second = await post(OVERDUE_INVOICE_ID);
    const firstBody = await first.json();
    const secondBody = await second.json();
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);

    const account = await getCustomer(COBALT_CUSTOMER_ID);
    const nudges = account?.activities.filter((activity) => activity.type === NUDGE_SENT) ?? [];
    expect(nudges.map((activity) => activity.id).sort()).toEqual(
      [firstBody.activity.id, secondBody.activity.id].sort(),
    );
    expect(nudges.every((activity) => activity.status === NUDGE_STATUS_SENT)).toBe(true);
    expect(nudges[0] && nudges[1] && nudges[0].createdAt >= nudges[1].createdAt).toBe(true);
    expect(recordedNudges()).toHaveLength(2);
  });

  it("returns 404 when the invoice does not exist and sends nothing", async () => {
    const response = await post("inv_missing");

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Invoice not found" });
    expect(recordedNudges()).toEqual([]);
    expect(await prisma.activity.count({ where: { type: NUDGE_SENT } })).toBe(0);
  });

  it("returns 400 for an invoice that is not overdue and stores nothing", async () => {
    const response = await post(OPEN_INVOICE_ID);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Only an OVERDUE invoice can be nudged.",
    });
    expect(recordedNudges()).toEqual([]);
    expect(await prisma.activity.count({ where: { invoiceId: OPEN_INVOICE_ID } })).toBe(0);
  });

  it("returns 400 when the account has no email on file and stores nothing", async () => {
    await prisma.customer.update({
      where: { id: COBALT_CUSTOMER_ID },
      data: { email: "" },
    });

    const response = await post(OVERDUE_INVOICE_ID);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "No email address is on file for this account.",
    });
    expect(recordedNudges()).toEqual([]);
    expect(await prisma.activity.count({ where: { invoiceId: OVERDUE_INVOICE_ID } })).toBe(0);
  });

  it("does not log a sent nudge when the transport refuses the message", async () => {
    const result = await sendInvoiceNudge(OVERDUE_INVOICE_ID, {
      async send() {
        return { ok: false, reason: "rejected" };
      },
    });

    expect(result).toEqual({ ok: false, status: 400, error: "Nudge was not sent." });
    expect(await prisma.activity.count({ where: { invoiceId: OVERDUE_INVOICE_ID } })).toBe(0);
  });
});
