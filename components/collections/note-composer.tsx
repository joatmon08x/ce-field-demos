export function NoteComposer({
  customerId,
  invoices,
}: {
  customerId: string;
  invoices: { id: string; number: string }[];
}) {
  const targets = invoices.map((invoice) => invoice.number).join(", ");
  return (
    <p className="text-sm text-muted-foreground">
      Note composer for {customerId}
      {targets ? ` (${targets})` : ""} is not ready.
    </p>
  );
}
