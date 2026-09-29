import { NextResponse } from "next/server";
import { isPaymentMethod, outstandingCents } from "@/lib/collections";
import { DEMO_AS_OF } from "@/lib/clock";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

class BalanceChangedError extends Error {}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: { method?: unknown; amountCents?: unknown };
  try {
    body = (await request.json()) as { method?: unknown; amountCents?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { payments: true },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const method = body.method;
  if (!isPaymentMethod(method)) {
    return NextResponse.json(
      { error: "method must be check, ach, card_on_file, or cash" },
      { status: 400 },
    );
  }

  const outstanding = outstandingCents(invoice.totalCents, invoice.payments);
  if (outstanding === 0) {
    return NextResponse.json({ error: "Invoice has no outstanding balance" }, { status: 400 });
  }

  const amountCents = body.amountCents;
  if (amountCents !== undefined && amountCents !== null && amountCents !== outstanding) {
    return NextResponse.json(
      { error: "Only the full outstanding balance can be recorded" },
      { status: 400 },
    );
  }

  const recorded = await prisma.$transaction(async (tx) => {
    // Re-check inside the transaction so two overlapping posts cannot both settle the invoice.
    const current = await tx.invoice.findUniqueOrThrow({
      where: { id: invoice.id },
      include: { payments: true },
    });
    if (outstandingCents(current.totalCents, current.payments) !== outstanding) {
      throw new BalanceChangedError();
    }
    const payment = await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        amountCents: outstanding,
        method,
        recordedBy: DEMO_OPERATOR.name,
        recordedAt: DEMO_AS_OF,
      },
    });
    const updated = await tx.invoice.update({
      where: { id: invoice.id },
      data: { status: "PAID", paidOn: DEMO_AS_OF },
    });
    await tx.activity.create({
      data: {
        customerId: invoice.customerId,
        invoiceId: invoice.id,
        type: "PAYMENT_RECORDED",
        actorName: DEMO_OPERATOR.name,
        status: "recorded",
        payload: JSON.stringify({
          amountCents: outstanding,
          method,
          invoiceNumber: invoice.number,
        }),
        occurredOn: DEMO_AS_OF,
      },
    });
    return { payment, invoice: updated };
  }).catch((error: unknown) => {
    if (error instanceof BalanceChangedError) return null;
    throw error;
  });

  if (!recorded) {
    return NextResponse.json(
      { error: "Outstanding balance changed before the payment was recorded" },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true, payment: recorded.payment, invoice: recorded.invoice });
}
