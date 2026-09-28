import { Button } from "@/components/ui/button";

export function RecordPayment({
  invoiceId,
  invoiceNumber,
  outstandingCents,
  status,
}: {
  invoiceId: string;
  invoiceNumber: string;
  outstandingCents: number;
  status: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {invoiceNumber} ({invoiceId}) is {status}. Outstanding {outstandingCents} cents.
      </p>
      <Button type="button" disabled>
        Record payment
      </Button>
    </div>
  );
}
