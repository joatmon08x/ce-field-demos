import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { POST } from "@/app/api/invoices/[id]/nudge/route";
import type { NudgeSentPayload } from "@/lib/collections/activity";
import { isDeliverableEmail, nudgeTemplate } from "@/lib/collections/nudge";
import { formatDate } from "@/lib/dates";
import { formatUsd } from "@/lib/money";
import { PLAN_PRICE_CENTS } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

const INVOICE_ID = "inv_1043";
const CUSTOMER_ID = "cus_quarrypine";
const request = new Request("http://localhost/api/invoices/inv_1043/nudge", { method: "POST" });
const params = (id: string) => ({ params: Promise.resolve({ id }) });

let seededEmail = "";

async function restoreCustomerEmail(email: string) {
  await prisma.customer.update({
    where: { id: CUSTOMER_ID },
    data: { email },
  });
}

async function deleteCreatedActivities() {
  await prisma.activity.deleteMany({
    where: { invoiceId: INVOICE_ID, type: "NUDGE_SENT" },
  });
}

beforeAll(async () => {
  const customer = await prisma.customer.findUniqueOrThrow({ where: { id: CUSTOMER_ID } });
  seededEmail = customer.email;
});

afterEach(async () => {
  await deleteCreatedActivities();
  if (seededEmail) await restoreCustomerEmail(seededEmail);
});

describe("invoice nudge", () => {
  it("sends a nudge for a seeded overdue invoice with a deliverable email", async () => {
    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: INVOICE_ID },
      include: { customer: true },
    });
    expect(invoice.customerId).toBe(CUSTOMER_ID);
    expect(invoice.status).toBe("OVERDUE");
    expect(invoice.customer.email.endsWith(".example")).toBe(true);

    const response = await POST(request, params(INVOICE_ID));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("sent");
    expect(body.to).toBe(invoice.customer.email);
    expect(body.reason).toBeUndefined();

    const activity = await prisma.activity.findUniqueOrThrow({
      where: { id: body.activityId },
    });
    const payload = JSON.parse(activity.payload) as NudgeSentPayload;
    expect(activity.type).toBe("NUDGE_SENT");
    expect(activity.status).toBe("sent");
    expect(activity.customerId).toBe(CUSTOMER_ID);
    expect(activity.invoiceId).toBe(INVOICE_ID);
    expect(payload.channel).toBe("email");
    expect(payload.invoiceNumber).toBe(invoice.number);
    expect(payload.outstandingCents).toBe(invoice.totalCents);
    expect(payload.dueOn).toBe(invoice.dueOn.toISOString());

    const written = await prisma.activity.count({
      where: { invoiceId: INVOICE_ID, type: "NUDGE_SENT" },
    });
    expect(written).toBe(1);
  });

  it("records a failed nudge when the customer email is blank", async () => {
    const customer = await prisma.customer.findUniqueOrThrow({ where: { id: CUSTOMER_ID } });
    const originalEmail = customer.email;
    try {
      await prisma.customer.update({
        where: { id: CUSTOMER_ID },
        data: { email: "" },
      });

      const response = await POST(request, params(INVOICE_ID));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe("failed");
      expect(body.reason).toBe("missing or invalid email");

      const activity = await prisma.activity.findUniqueOrThrow({
        where: { id: body.activityId },
      });
      const payload = JSON.parse(activity.payload) as NudgeSentPayload;
      expect(activity.type).toBe("NUDGE_SENT");
      expect(activity.status).toBe("failed");
      expect(payload.reason).toBe(body.reason);
    } finally {
      await deleteCreatedActivities();
      await restoreCustomerEmail(originalEmail);
    }
  });

  it("returns 404 for an unknown invoice", async () => {
    const response = await POST(request, params("inv_missing"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Invoice not found" });
    expect(body.activityId).toBeUndefined();
  });

  it("names the invoice number, outstanding amount, and due date in the template", () => {
    const dueOn = new Date("2026-08-09T12:00:00.000Z");
    const text = nudgeTemplate({
      invoiceNumber: "INV-1043",
      outstandingCents: PLAN_PRICE_CENTS.SCALE,
      dueOn,
    });

    expect(text).toContain("INV-1043");
    expect(text).toContain(formatUsd(PLAN_PRICE_CENTS.SCALE));
    expect(text).toContain(formatDate(dueOn));
  });

  it("accepts one address and rejects blank or malformed values", () => {
    expect(isDeliverableEmail("")).toBe(false);
    expect(isDeliverableEmail("no-at-sign")).toBe(false);
    expect(isDeliverableEmail("two@@example")).toBe(false);
    expect(isDeliverableEmail("ops@cobalt.example")).toBe(true);
  });
});
