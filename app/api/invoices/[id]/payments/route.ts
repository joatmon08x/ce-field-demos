import { NextResponse } from "next/server";
import { outstandingCents } from "@/lib/collections/balance";
import { isPaymentMethod, PaymentError, recordFullPayment } from "@/lib/collections/payments";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof payload !== "object" || payload === null) {
    return NextResponse.json({ error: "Invalid payment request" }, { status: 400 });
  }

  const body = payload as { method?: unknown; amountCents?: unknown };
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { payments: true },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
  if (!isPaymentMethod(body.method)) {
    return NextResponse.json(
      { error: "Payment method must be check, ach, card_on_file, or cash" },
      { status: 400 },
    );
  }

  const due = outstandingCents(invoice);
  if (due === 0) {
    return NextResponse.json({ error: "Invoice has no outstanding balance" }, { status: 400 });
  }
  if (Object.prototype.hasOwnProperty.call(body, "amountCents") && body.amountCents !== due) {
    return NextResponse.json(
      { error: "amountCents must equal the outstanding balance" },
      { status: 400 },
    );
  }

  try {
    const { payment, invoice: updated } = await recordFullPayment(id, body.method);
    return NextResponse.json(
      {
        payment,
        invoice: { id: updated.id, status: updated.status, paidOn: updated.paidOn },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof PaymentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
