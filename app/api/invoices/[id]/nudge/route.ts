import { NextResponse } from "next/server";
import { isEmailAddress, nudgeTemplate, outstandingCents } from "@/lib/collections";
import { DEMO_AS_OF } from "@/lib/clock";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, payments: true },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const to = invoice.customer.email;
  const status = isEmailAddress(to) ? "sent" : "failed";
  const template = nudgeTemplate({
    invoiceNumber: invoice.number,
    outstandingCents: outstandingCents(invoice.totalCents, invoice.payments),
    dueOn: invoice.dueOn,
  });

  const activity = await prisma.activity.create({
    data: {
      customerId: invoice.customerId,
      invoiceId: invoice.id,
      type: "NUDGE_SENT",
      actorName: DEMO_OPERATOR.name,
      status,
      payload: JSON.stringify({
        channel: "email",
        to,
        template,
        invoiceNumber: invoice.number,
        failureReason: status === "failed" ? "No valid email address on file" : undefined,
      }),
      occurredOn: DEMO_AS_OF,
    },
  });

  return NextResponse.json({ ok: true, status, activity });
}
