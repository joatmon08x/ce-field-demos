import { afterEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/invoices/[id]/payments/route";
import { DEMO_AS_OF } from "@/lib/clock";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";
import { PLAN_PRICE_CENTS } from "@/lib/plans";

const INVOICE_ID = "inv_1043";

const params = (id: string) => ({ params: Promise.resolve({ id }) });

function post(id: string, body: unknown) {
  return POST(
    new Request(`http://localhost/api/invoices/${id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    params(id),
  );
}

async function restoreInvoice() {
  await prisma.payment.deleteMany({ where: { invoiceId: INVOICE_ID } });
  await prisma.activity.deleteMany({ where: { invoiceId: INVOICE_ID } });
  await prisma.invoice.update({
    where: { id: INVOICE_ID },
    data: { status: "OVERDUE", paidOn: null },
  });
}

afterEach(async () => {
  await restoreInvoice();
});

describe("POST /api/invoices/[id]/payments", () => {
  it("records a full payment on an OVERDUE invoice", async () => {
    const before = await prisma.invoice.findUniqueOrThrow({
      where: { id: INVOICE_ID },
      include: { payments: true },
    });
    expect(before.customerId).toBe("cus_quarrypine");
    expect(before.status).toBe("OVERDUE");
    expect(before.paidOn).toBeNull();
    expect(before.payments).toHaveLength(0);
    expect(before.totalCents).toBe(PLAN_PRICE_CENTS.SCALE);

    const response = await post(INVOICE_ID, { method: "check" });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.invoice).toEqual({
      id: INVOICE_ID,
      status: "PAID",
      paidOn: DEMO_AS_OF.toISOString(),
    });
    expect(body.payment).toMatchObject({
      invoiceId: INVOICE_ID,
      amountCents: before.totalCents,
      method: "check",
      recordedBy: DEMO_OPERATOR.name,
    });
    expect(body.payment.id).toMatch(/^pay_/);

    const stored = await prisma.invoice.findUniqueOrThrow({
      where: { id: INVOICE_ID },
      include: { payments: true },
    });
    expect(stored.status).toBe("PAID");
    expect(stored.paidOn?.toISOString()).toBe(DEMO_AS_OF.toISOString());
    expect(stored.payments).toHaveLength(1);
    expect(stored.payments[0]).toMatchObject({
      amountCents: before.totalCents,
      method: "check",
      recordedBy: DEMO_OPERATOR.name,
    });

    const activities = await prisma.activity.findMany({
      where: { invoiceId: INVOICE_ID, type: "PAYMENT_RECORDED" },
    });
    expect(activities).toHaveLength(1);
    expect(activities[0]).toMatchObject({
      customerId: "cus_quarrypine",
      status: "recorded",
      actorName: DEMO_OPERATOR.name,
    });
    expect(activities[0].occurredOn.toISOString()).toBe(DEMO_AS_OF.toISOString());
    expect(JSON.parse(activities[0].payload)).toEqual({
      invoiceNumber: before.number,
      amountCents: before.totalCents,
      method: "check",
    });
  });

  it("accepts amountCents only when it equals the outstanding balance", async () => {
    const before = await prisma.invoice.findUniqueOrThrow({ where: { id: INVOICE_ID } });
    const response = await post(INVOICE_ID, {
      method: "ach",
      amountCents: before.totalCents,
    });

    expect(response.status).toBe(201);
    const stored = await prisma.invoice.findUniqueOrThrow({
      where: { id: INVOICE_ID },
      include: { payments: true },
    });
    expect(stored.status).toBe("PAID");
    expect(stored.payments).toHaveLength(1);
    expect(stored.payments[0].amountCents).toBe(before.totalCents);
  });

  it("rejects a mismatched amountCents and stores nothing", async () => {
    const response = await post(INVOICE_ID, { method: "ach", amountCents: 100 });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: expect.any(String) });

    const stored = await prisma.invoice.findUniqueOrThrow({
      where: { id: INVOICE_ID },
      include: { payments: true },
    });
    expect(stored.status).toBe("OVERDUE");
    expect(stored.paidOn).toBeNull();
    expect(stored.payments).toHaveLength(0);
    expect(await prisma.activity.count({ where: { invoiceId: INVOICE_ID } })).toBe(0);
  });

  it("rejects a second payment once the invoice is paid", async () => {
    const first = await post(INVOICE_ID, { method: "cash" });
    expect(first.status).toBe(201);

    const second = await post(INVOICE_ID, { method: "card_on_file" });
    const body = await second.json();

    expect(second.status).toBe(400);
    expect(body).toEqual({ error: expect.any(String) });

    const stored = await prisma.invoice.findUniqueOrThrow({
      where: { id: INVOICE_ID },
      include: { payments: true },
    });
    expect(stored.status).toBe("PAID");
    expect(stored.payments).toHaveLength(1);
    expect(await prisma.activity.count({ where: { invoiceId: INVOICE_ID } })).toBe(1);
  });

  it("rejects a method outside check, ach, card_on_file, and cash", async () => {
    const response = await post(INVOICE_ID, { method: "wire" });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: expect.any(String) });

    const stored = await prisma.invoice.findUniqueOrThrow({
      where: { id: INVOICE_ID },
      include: { payments: true },
    });
    expect(stored.status).toBe("OVERDUE");
    expect(stored.payments).toHaveLength(0);
    expect(await prisma.activity.count({ where: { invoiceId: INVOICE_ID } })).toBe(0);
  });

  it("returns 404 for an unknown invoice", async () => {
    const response = await post("inv_missing", { method: "check" });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Invoice not found" });
    expect(await prisma.payment.count({ where: { invoiceId: "inv_missing" } })).toBe(0);
  });
});
