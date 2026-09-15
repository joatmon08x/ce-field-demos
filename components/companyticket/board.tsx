import Link from "next/link";
import { listSprintBoard, type Ticket } from "@/lib/companyticket/tickets";
import { TicketCard } from "./ticket-card";

type BoardData = NonNullable<ReturnType<typeof listSprintBoard>>;

export function Board({ board, backlog }: { board: BoardData; backlog: readonly Ticket[] }) {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-4 py-5 sm:px-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-indigo uppercase">Active sprint</p>
          <h1 className="text-2xl font-semibold tracking-tight">{board.sprint.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{board.sprint.goal}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          {board.sprint.startOn} → {board.sprint.endOn} · {board.project.keyScheme}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <section className="rounded-[var(--radius-lg)] border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold">Backlog</h2>
            <span className="text-xs text-muted-foreground">{backlog.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {backlog.map((ticket) => (
              <TicketCard key={ticket.key} ticket={ticket} compact />
            ))}
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-3">
          {board.columns.map((column) => (
            <section key={column.status} className="rounded-[var(--radius-lg)] border border-border bg-muted/40 p-3">
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold">{column.status}</h2>
                <span className="text-xs text-muted-foreground">{column.tickets.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {column.tickets.length === 0 ? (
                  <p className="px-1 py-6 text-center text-xs text-muted-foreground">No cards</p>
                ) : (
                  column.tickets.map((ticket) => <TicketCard key={ticket.key} ticket={ticket} />)
                )}
              </div>
            </section>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Board also at{" "}
        <Link href={`/api/companyticket/tickets?sprintId=${board.sprint.id}`}>/api/companyticket/tickets</Link>.
        MCP server name <span className="font-mono">companyticket</span>.
      </p>
    </div>
  );
}
