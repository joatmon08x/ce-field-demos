import { formatUsd } from "@/lib/money";
import { amountsVisible } from "@/lib/plans";

export const AMOUNT_MASK_TEXT = "Upgrade to view amounts";

export function GatedAmount({ cents, plan }: { cents: number; plan: string }) {
  if (!amountsVisible(plan)) {
    return <span className="text-muted-foreground">{AMOUNT_MASK_TEXT}</span>;
  }
  return <span>{formatUsd(cents)}</span>;
}
