import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { recordFullPayment } from "@/lib/payments";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const method = await readMethod(request);
  const result = await recordFullPayment(id, method);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  revalidatePayment(id, result.activity.customerId);

  return NextResponse.json({
    payment: {
      id: result.payment.id,
      invoiceId: result.payment.invoiceId,
      amountCents: result.payment.amountCents,
      method: result.payment.method,
      recordedBy: result.payment.recordedBy,
      recordedAt: result.payment.recordedAt.toISOString(),
    },
    activity: {
      id: result.activity.id,
      customerId: result.activity.customerId,
      invoiceId: result.activity.invoiceId,
      type: result.activity.type,
      status: result.activity.status,
      amountCents: result.activity.amountCents,
      method: result.activity.method,
      actorName: result.activity.actorName,
      occurredOn: result.activity.occurredOn.toISOString(),
    },
  });
}

async function readMethod(request: Request): Promise<unknown> {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("method" in body)) return undefined;
    return body.method;
  } catch {
    return undefined;
  }
}

function revalidatePayment(invoiceId: string, customerId: string) {
  if (process.env.VITEST) return;
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/customers");
}
