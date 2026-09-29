import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { POST } from "@/app/api/invoices/[id]/payments/route";
import { DEMO_AS_OF } from "@/lib/clock";
import { prisma } from "@/lib/prisma";

const params = (id: string) => ({ params: Promise.resolve({ id }) });

function pay(id: string, body: unknown) {
  return new Request(`http://localhost/api/invoices/${id}/payments`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/invoices/[id]/payments", () => {
  let invoiceId = "";
  let totalCents = 0;
  let originalStatus = "";
  let originalPaidOn: Date | null = null;

  beforeAll(async () => {
    const invoice = await prisma.invoice.findFirstOrThrow({
      where: { status: "OVERDUE" },
      orderBy: { id: "asc" },
    });
    invoiceId = invoice.id;
    totalCents = invoice.totalCents;
    originalStatus = invoice.status;
    originalPaidOn = invoice.paidOn;
  });

  afterEach(async () => {
    await restoreInvoice();
  });

  afterAll(async () => {
    await restoreInvoice();
    await prisma.$disconnect();
  });

  async function restoreInvoice() {
    if (!invoiceId) return;
    await prisma.payment.deleteMany({ where: { invoiceId } });
    await prisma.activity.deleteMany({ where: { invoiceId } });
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: originalStatus, paidOn: originalPaidOn },
    });
  }

  it("records the full outstanding balance as cash", async () => {
    const response = await POST(pay(invoiceId, { method: "cash" }), params(invoiceId));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.invoice.status).toBe("PAID");
    expect(body.invoice.paidOn).toBe(DEMO_AS_OF.toISOString());

    const stored = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
    expect(stored.status).toBe("PAID");
    expect(stored.paidOn).toEqual(DEMO_AS_OF);

    const payments = await prisma.payment.findMany({ where: { invoiceId } });
    expect(payments).toHaveLength(1);
    expect(payments[0]?.amountCents).toBe(totalCents);

    const activities = await prisma.activity.findMany({
      where: { invoiceId, type: "PAYMENT_RECORDED" },
    });
    expect(activities).toHaveLength(1);
    expect(activities[0]?.status).toBe("recorded");
  });

  it("rejects a second payment once the balance is zero", async () => {
    const first = await POST(pay(invoiceId, { method: "cash" }), params(invoiceId));
    expect(first.status).toBe(200);

    const paymentsBefore = await prisma.payment.count({ where: { invoiceId } });
    const activitiesBefore = await prisma.activity.count({ where: { invoiceId } });

    const second = await POST(pay(invoiceId, { method: "cash" }), params(invoiceId));
    expect(second.status).toBe(400);
    await expect(second.json()).resolves.toEqual({ error: "Invoice has no outstanding balance" });

    const stored = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
    expect(stored.status).toBe("PAID");
    expect(await prisma.payment.count({ where: { invoiceId } })).toBe(paymentsBefore);
    expect(await prisma.activity.count({ where: { invoiceId } })).toBe(activitiesBefore);
  });

  it("rejects a partial amount and stores nothing", async () => {
    const response = await POST(
      pay(invoiceId, { method: "check", amountCents: totalCents - 100 }),
      params(invoiceId),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Only the full outstanding balance can be recorded",
    });

    expect(await prisma.payment.count({ where: { invoiceId } })).toBe(0);
    expect(await prisma.activity.count({ where: { invoiceId } })).toBe(0);

    const stored = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
    expect(stored.status).toBe("OVERDUE");
    expect(stored.paidOn).toEqual(originalPaidOn);
  });

  it("rejects an unknown payment method", async () => {
    const response = await POST(pay(invoiceId, { method: "wire" }), params(invoiceId));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "method must be check, ach, card_on_file, or cash",
    });
  });

  it("returns 404 for an unknown invoice", async () => {
    const response = await POST(pay("inv_missing", { method: "cash" }), params("inv_missing"));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Invoice not found" });
  });
});
