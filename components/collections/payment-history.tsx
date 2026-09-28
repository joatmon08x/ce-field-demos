import { GatedAmount } from "@/components/collections/gated-amount";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { paymentMethodLabel } from "@/lib/collections/payments";
import { formatDate } from "@/lib/dates";

export function PaymentHistory({
  payments,
  plan,
}: {
  payments: {
    id: string;
    amountCents: number;
    method: string;
    recordedBy: string;
    recordedAt: Date;
  }[];
  plan: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments recorded.</p>
        ) : (
          <ul className="space-y-3 text-sm">
            {payments.map((payment) => (
              <li key={payment.id} className="flex items-baseline justify-between gap-4">
                <div>
                  <p>{formatDate(payment.recordedAt)}</p>
                  <p className="text-muted-foreground">
                    {paymentMethodLabel(payment.method)} · {payment.recordedBy}
                  </p>
                </div>
                <GatedAmount cents={payment.amountCents} plan={plan} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
