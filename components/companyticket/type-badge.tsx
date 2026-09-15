import type { TicketType } from "@/lib/companyticket/tickets";

export function TypeBadge({ type }: { type: TicketType }) {
  return (
    <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
      {type}
    </span>
  );
}
