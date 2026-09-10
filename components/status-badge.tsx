import { Badge } from "@/components/ui/badge";
import { disputeStatusLabel, invoiceStatusLabel } from "@/lib/status";

export function InvoiceStatusBadge({ status }: { status: string }) {
  if (status === "DISPUTED") {
    return <Badge variant="danger">Disputed</Badge>;
  }

  const variant =
    status === "PAID"
      ? "success"
      : status === "OVERDUE"
        ? "danger"
        : status === "OPEN"
          ? "warning"
          : status === "VOID"
            ? "muted"
            : "secondary";

  return <Badge variant={variant}>{invoiceStatusLabel(status)}</Badge>;
}

export function DisputeStatusBadge({ status }: { status: string }) {
  const variant =
    status === "NEEDS_REVIEW"
      ? "danger"
      : status === "ACCEPTED"
        ? "success"
        : status === "DECLINED"
          ? "muted"
          : "warning";

  return <Badge variant={variant}>{disputeStatusLabel(status)}</Badge>;
}
