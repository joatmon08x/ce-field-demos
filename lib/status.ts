export const INVOICE_STATUSES = ["DRAFT", "OPEN", "PAID", "OVERDUE", "VOID"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const DISPUTE_STATUSES = ["OPEN", "NEEDS_REVIEW", "ACCEPTED", "DECLINED"] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

export function invoiceStatusLabel(status: string): string {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "OPEN":
      return "Open";
    case "PAID":
      return "Paid";
    case "OVERDUE":
      return "Overdue";
    case "VOID":
      return "Void";
    default:
      return status;
  }
}

export function disputeStatusLabel(status: string): string {
  switch (status) {
    case "OPEN":
      return "Open";
    case "NEEDS_REVIEW":
      return "Needs review";
    case "ACCEPTED":
      return "Accepted";
    case "DECLINED":
      return "Declined";
    default:
      return status;
  }
}
