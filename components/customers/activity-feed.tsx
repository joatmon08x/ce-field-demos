import { Amount, MASKED_AMOUNT_TEXT } from "@/components/amount";
import { NoteItem } from "@/components/customers/note-item";
import { canEditNote } from "@/lib/collections";
import { formatDate } from "@/lib/dates";
import { amountsVisible } from "@/lib/plans";

type NoteRow = {
  id: string;
  authorName: string;
  body: string;
  createdAt: Date;
};

type ActivityRow = {
  id: string;
  type: string;
  actorName: string;
  status: string;
  payload: string;
  occurredOn: Date;
  createdAt: Date;
};

function readPayload(raw: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return {};
  }
  return {};
}

function activityLabel(type: string, status: string): string {
  if (type === "NOTE_ADDED") return "Note added";
  if (type === "NUDGE_SENT") return status === "failed" ? "Nudge failed" : "Nudge sent";
  if (type === "PAYMENT_RECORDED") return "Payment recorded";
  return type;
}

function formatClock(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(value);
}

function methodLabel(method: string): string {
  if (method === "check") return "Check";
  if (method === "ach") return "ACH";
  if (method === "card_on_file") return "Card on file";
  if (method === "cash") return "Cash";
  return method;
}

export function ActivityFeed({
  activities,
  notes,
  plan,
}: {
  activities: ActivityRow[];
  notes: NoteRow[];
  plan: string;
}) {
  const notesById = new Map(notes.map((note) => [note.id, note]));
  const rows = [...activities].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity on this account.</p>;
  }

  return (
    <ol className="divide-y divide-border">
      {rows.map((activity) => {
        const payload = readPayload(activity.payload);
        return (
          <li key={activity.id} className="py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium">{activityLabel(activity.type, activity.status)}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(activity.occurredOn)} · {formatClock(activity.createdAt)}
              </p>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{activity.actorName}</p>
            <div className="mt-2">{renderBody(activity, payload, notesById, plan)}</div>
          </li>
        );
      })}
    </ol>
  );
}

function renderBody(
  activity: ActivityRow,
  payload: Record<string, unknown>,
  notesById: Map<string, NoteRow>,
  plan: string,
) {
  if (activity.type === "NOTE_ADDED") {
    const noteId = payload.noteId;
    const note = typeof noteId === "string" ? notesById.get(noteId) : undefined;
    if (!note) {
      return <p className="text-sm text-muted-foreground">Note is not on this account.</p>;
    }
    return <NoteItem noteId={note.id} body={note.body} editable={canEditNote(note)} />;
  }

  if (activity.type === "NUDGE_SENT") {
    const template = typeof payload.template === "string" ? payload.template : "";
    const invoiceNumber = typeof payload.invoiceNumber === "string" ? payload.invoiceNumber : "";
    const failureReason = typeof payload.failureReason === "string" ? payload.failureReason : "";
    // The stored template carries the balance, so it only shows on catalog plans.
    const text = amountsVisible(plan)
      ? template
      : `Reminder sent for ${invoiceNumber || "this invoice"} · ${MASKED_AMOUNT_TEXT}`;
    return (
      <div className="space-y-2">
        {text ? <p className="text-sm whitespace-pre-wrap">{text}</p> : null}
        {activity.status === "failed" ? (
          <p className="rounded-md bg-danger-soft px-2 py-1 text-sm text-danger">
            Failed{failureReason ? ` · ${failureReason}` : ""}
          </p>
        ) : null}
      </div>
    );
  }

  if (activity.type === "PAYMENT_RECORDED") {
    const amountCents = typeof payload.amountCents === "number" ? payload.amountCents : null;
    const method = typeof payload.method === "string" ? payload.method : "";
    return (
      <p className="text-sm">
        {amountCents !== null ? <Amount cents={amountCents} plan={plan} /> : null}
        {amountCents !== null && method ? " · " : null}
        {method ? methodLabel(method) : null}
      </p>
    );
  }

  return null;
}
