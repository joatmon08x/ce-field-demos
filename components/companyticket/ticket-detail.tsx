import Link from "next/link";
import type { getTicket } from "@/lib/companyticket/tickets";
import { TicketKey } from "./ticket-key";
import { TypeBadge } from "./type-badge";

type TicketView = NonNullable<ReturnType<typeof getTicket>>;

export function TicketDetail({ ticket }: { ticket: TicketView }) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6">
      <p className="text-sm">
        <Link href="/companyticket" className="text-indigo hover:underline">
          ← Board
        </Link>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <TicketKey value={ticket.key} />
        <TypeBadge type={ticket.type} />
        <span className="rounded-full border border-border px-2 py-0.5 text-xs">{ticket.status}</span>
        <span className="rounded-full border border-border px-2 py-0.5 text-xs">{ticket.priority}</span>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">{ticket.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{ticket.summary}</p>
      </div>

      <section className="grid gap-4 rounded-[var(--radius-lg)] border border-border bg-card p-5 sm:grid-cols-3">
        <Meta label="Assignee" value={ticket.assignee} />
        <Meta label="Reporter" value={ticket.reporter} />
        <Meta label="Sprint" value={ticket.sprint?.name ?? "Backlog"} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Description</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{ticket.description}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Acceptance</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {ticket.acceptance.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Ledgerly surfaces</h2>
        <ul className="space-y-1 text-sm">
          {ticket.ledgerlyUrls.map((url) => (
            <li key={url}>
              <a href={url} className="text-indigo hover:underline">
                {url}
              </a>
            </li>
          ))}
        </ul>
        <p className="font-mono text-xs text-muted-foreground">{ticket.ledgerlyPaths.join(" · ")}</p>
      </section>

      {ticket.comments.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Comments</h2>
          {ticket.comments.map((comment) => (
            <article key={comment.id} className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">
                {comment.author} · {comment.createdOn}
              </p>
              <p className="mt-1 text-sm">{comment.body}</p>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
