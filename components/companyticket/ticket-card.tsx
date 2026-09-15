import Link from "next/link";
import type { Ticket } from "@/lib/companyticket/tickets";
import { TicketKey } from "./ticket-key";
import { TypeBadge } from "./type-badge";

export function TicketCard({ ticket, compact = false }: { ticket: Ticket; compact?: boolean }) {
  return (
    <Link
      href={`/companyticket/${ticket.key}`}
      className="block rounded-lg border border-border bg-card p-3 hover:border-indigo/40 hover:bg-accent/40"
    >
      <div className="flex items-center justify-between gap-2">
        <TicketKey value={ticket.key} />
        <TypeBadge type={ticket.type} />
      </div>
      <p className={`mt-2 font-medium ${compact ? "text-xs" : "text-sm"} leading-snug`}>{ticket.title}</p>
      {compact ? null : (
        <p className="mt-2 text-xs text-muted-foreground">
          {ticket.priority} · {ticket.assignee}
        </p>
      )}
    </Link>
  );
}
