import { formatUsd } from "@/lib/money";
import { amountsVisible } from "@/lib/plans";
import { cn } from "@/lib/utils";

export const MASKED_AMOUNT_TEXT = "Upgrade to view amounts";

export function Amount({
  cents,
  plan,
  className,
}: {
  cents: number;
  plan: string;
  className?: string;
}) {
  if (!amountsVisible(plan)) {
    return <span className={cn("text-muted-foreground", className)}>{MASKED_AMOUNT_TEXT}</span>;
  }

  return <span className={className}>{formatUsd(cents)}</span>;
}
