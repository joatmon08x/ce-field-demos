import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { sendInvoiceNudge } from "@/lib/nudge";

// The reminder copy is fixed. This route does not read a request body.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await sendInvoiceNudge(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  revalidateNudge(result.activity.customerId);

  const { activity } = result;
  return NextResponse.json({
    activity: {
      id: activity.id,
      customerId: activity.customerId,
      invoiceId: activity.invoiceId,
      type: activity.type,
      status: activity.status,
      channel: activity.channel,
      body: activity.body,
      amountCents: activity.amountCents,
      actorName: activity.actorName,
      occurredOn: activity.occurredOn.toISOString(),
      to: activity.to,
    },
  });
}

function revalidateNudge(customerId: string) {
  if (process.env.VITEST) return;
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/customers");
}
