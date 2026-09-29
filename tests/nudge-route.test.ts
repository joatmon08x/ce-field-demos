import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { POST } from "@/app/api/invoices/[id]/nudge/route";
import { formatDate } from "@/lib/dates";
import { formatUsd } from "@/lib/money";
import { prisma } from "@/lib/prisma";

const request = new Request("http://localhost/api/invoices/nudge", { method: "POST" });
const params = (id: string) => ({ params: Promise.resolve({ id }) });

describe("POST /api/invoices/[id]/nudge", () => {
  let invoiceId: string;
  let invoiceNumber: string;
  let customerId: string;
  let originalEmail: string;
  let totalCents: number;
  let dueOn: Date;
  const createdIds: string[] = [];

  beforeAll(async () => {
    const invoice = await prisma.invoice.findFirstOrThrow({
      where: { status: "OVERDUE" },
      include: { customer: true },
    });
    invoiceId = invoice.id;
    invoiceNumber = invoice.number;
    customerId = invoice.customerId;
    originalEmail = invoice.customer.email;
    totalCents = invoice.totalCents;
    dueOn = invoice.dueOn;
  });

  async function restoreEmail() {
    if (!customerId || originalEmail === undefined) return;
    await prisma.customer.update({
      where: { id: customerId },
      data: { email: originalEmail },
    });
  }

  async function deleteCreated() {
    if (createdIds.length === 0) return;
    const ids = [...createdIds];
    await prisma.activity.deleteMany({ where: { id: { in: ids } } });
    createdIds.length = 0;
  }

  afterEach(async () => {
    await deleteCreated();
    await restoreEmail();
  });

  afterAll(async () => {
    await deleteCreated();
    await restoreEmail();
  });

  async function postNudge(id: string) {
    const response = await POST(request, params(id));
    const body = await response.json();
    if (typeof body.activity?.id === "string") createdIds.push(body.activity.id);
    return { response, body };
  }

  it("records a sent nudge for a seeded overdue invoice", async () => {
    const { response, body } = await postNudge(invoiceId);

    expect(response.status).toBe(200);
    expect(body.status).toBe("sent");

    const activity = await prisma.activity.findUniqueOrThrow({
      where: { id: body.activity.id },
    });
    expect(activity.type).toBe("NUDGE_SENT");
    expect(activity.status).toBe("sent");
    expect(activity.invoiceId).toBe(invoiceId);
    expect(activity.actorName).toBe("Avery Quinn");

    const payload = JSON.parse(activity.payload) as {
      channel: string;
      to: string;
      template: string;
    };
    expect(payload.channel).toBe("email");
    expect(payload.to).toBe(originalEmail);
    expect(payload.template).toContain(invoiceNumber);
    expect(payload.template).toContain(formatUsd(totalCents));
    expect(payload.template).toContain(formatDate(dueOn));
  });

  it("records a failed nudge when the email is not an address", async () => {
    try {
      await prisma.customer.update({
        where: { id: customerId },
        data: { email: "not-an-email" },
      });

      const { response, body } = await postNudge(invoiceId);

      expect(response.status).toBe(200);
      expect(body.status).toBe("failed");

      const activity = await prisma.activity.findUniqueOrThrow({
        where: { id: body.activity.id },
      });
      expect(activity.type).toBe("NUDGE_SENT");
      expect(activity.status).toBe("failed");

      const payload = JSON.parse(activity.payload) as { failureReason?: string };
      expect(payload.failureReason).toBe("No valid email address on file");
    } finally {
      await restoreEmail();
    }
  });

  it("records a failed nudge when the email is empty", async () => {
    try {
      await prisma.customer.update({
        where: { id: customerId },
        data: { email: "" },
      });

      const { response, body } = await postNudge(invoiceId);

      expect(response.status).toBe(200);
      expect(body.status).toBe("failed");
    } finally {
      await restoreEmail();
    }
  });

  it("returns 404 for an unknown invoice", async () => {
    const response = await POST(request, params("inv_missing"));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Invoice not found" });
  });
});
