import { afterEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/invoices/[id]/payments/route";
import { DEMO_AS_OF } from "@/lib/clock";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { outstandingCents, overdueBook } from "@/lib/overdue-book";
import { PAYMENT_METHODS, PAYMENT_RECORDED } from "@/lib/payments";
import { PLAN_PRICE_CENTS } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

const OVERDUE_INVOICE_ID = "inv_1047";
const PAID_INVOICE_ID = "inv_1042";

function post(id: string, body: unknown) {
  return POST(
    new Request(`http://localhost/api/invoices/${id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  );
}

async function restoreOverdueInvoice() {
  await prisma.activity.deleteMany({ where: { invoiceId: OVERDUE_INVOICE_ID } });
  await prisma.payment.deleteMany({ where: { invoiceId: OVERDUE_INVOICE_ID } });
  await prisma.invoice.update({
    where: { id: OVERDUE_INVOICE_ID },
    data: { status: "OVERDUE", paidOn: null },
  });
}

async function restorePaidInvoice() {
  await prisma.activity.deleteMany({ where: { invoiceId: PAID_INVOICE_ID } });
  await prisma.payment.deleteMany({ where: { invoiceId: PAID_INVOICE_ID } });
  await prisma.invoice.update({
    where: { id: PAID_INVOICE_ID },
    data: { status: "PAID", paidOn: new Date("2026-08-04T12:00:00.000Z") },
  });
}

describe("record full payment", () => {
  afterEach(async () => {
    await restoreOverdueInvoice();
    await restorePaidInvoice();
  });

  it.each(PAYMENT_METHODS)(
    "records a %s payment for the outstanding balance and marks the invoice paid",
    async (method) => {
      const response = await post(OVERDUE_INVOICE_ID, { method });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.payment).toMatchObject({
        invoiceId: OVERDUE_INVOICE_ID,
        amountCents: PLAN_PRICE_CENTS.GROWTH,
        method,
        recordedBy: DEMO_OPERATOR.name,
        recordedAt: DEMO_AS_OF.toISOString(),
      });
      expect(body.activity).toMatchObject({
        type: PAYMENT_RECORDED,
        status: "recorded",
        amountCents: PLAN_PRICE_CENTS.GROWTH,
        method,
        actorName: DEMO_OPERATOR.name,
        occurredOn: DEMO_AS_OF.toISOString(),
      });

      const invoice = await prisma.invoice.findUniqueOrThrow({
        where: { id: OVERDUE_INVOICE_ID },
        include: {
          payments: true,
          customer: { include: { invoices: { include: { payments: true } }, activities: true } },
        },
      });
      expect(invoice.status).toBe("PAID");
      expect(invoice.paidOn?.toISOString()).toBe(DEMO_AS_OF.toISOString());
      expect(outstandingCents(invoice)).toBe(0);
      expect(invoice.payments).toHaveLength(1);
      expect(overdueBook(invoice.customer.invoices).map((row) => row.id)).not.toContain(
        OVERDUE_INVOICE_ID,
      );
      expect(invoice.customer.activities[0]).toMatchObject({
        type: PAYMENT_RECORDED,
        status: "recorded",
        method,
        actorName: DEMO_OPERATOR.name,
        amountCents: PLAN_PRICE_CENTS.GROWTH,
      });
    },
  );

  it("records the outstanding balance and ignores a client-supplied amount", async () => {
    const response = await post(OVERDUE_INVOICE_ID, { method: "check", amountCents: 100 });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.payment.amountCents).toBe(PLAN_PRICE_CENTS.GROWTH);
    expect(body.activity.amountCents).toBe(PLAN_PRICE_CENTS.GROWTH);
  });

  it("returns 400 when the outstanding balance is already 0 and leaves the status unchanged", async () => {
    const first = await post(OVERDUE_INVOICE_ID, { method: "ach" });
    expect(first.status).toBe(200);

    const second = await post(OVERDUE_INVOICE_ID, { method: "cash" });
    expect(second.status).toBe(400);
    await expect(second.json()).resolves.toEqual({ error: "Outstanding balance is 0." });

    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: OVERDUE_INVOICE_ID },
      include: { payments: true },
    });
    expect(invoice.status).toBe("PAID");
    expect(invoice.paidOn?.toISOString()).toBe(DEMO_AS_OF.toISOString());
    expect(invoice.payments).toHaveLength(1);
    expect(await prisma.activity.count({ where: { invoiceId: OVERDUE_INVOICE_ID } })).toBe(1);
  });

  it("returns 400 for an unknown method and stores nothing", async () => {
    const response = await post(OVERDUE_INVOICE_ID, { method: "wire" });

    expect(response.status).toBe(400);
    const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: OVERDUE_INVOICE_ID } });
    expect(invoice.status).toBe("OVERDUE");
    expect(invoice.paidOn).toBeNull();
    expect(await prisma.payment.count({ where: { invoiceId: OVERDUE_INVOICE_ID } })).toBe(0);
    expect(await prisma.activity.count({ where: { invoiceId: OVERDUE_INVOICE_ID } })).toBe(0);
  });

  it("returns 404 when the invoice does not exist", async () => {
    const response = await post("inv_missing", { method: "cash" });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Invoice not found" });
  });

  it("returns 400 for a settled invoice that has no payment rows and leaves it unchanged", async () => {
    const before = await prisma.invoice.findUniqueOrThrow({ where: { id: PAID_INVOICE_ID } });
    const response = await post(PAID_INVOICE_ID, { method: "check" });

    expect(response.status).toBe(400);
    const after = await prisma.invoice.findUniqueOrThrow({ where: { id: PAID_INVOICE_ID } });
    expect(after.status).toBe(before.status);
    expect(after.paidOn?.toISOString()).toBe(before.paidOn?.toISOString());
    expect(await prisma.payment.count({ where: { invoiceId: PAID_INVOICE_ID } })).toBe(0);
    expect(await prisma.activity.count({ where: { invoiceId: PAID_INVOICE_ID } })).toBe(0);
  });
});
