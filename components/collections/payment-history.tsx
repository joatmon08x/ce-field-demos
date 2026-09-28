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
    <p className="text-sm text-muted-foreground">
      {payments.length === 0
        ? `No payments recorded for ${plan}.`
        : `${payments.length} recorded on ${plan}.`}
    </p>
  );
}
