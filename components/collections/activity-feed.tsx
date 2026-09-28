import { NoteEditButton } from "@/components/collections/note-edit-button";
import { GatedAmount } from "@/components/collections/gated-amount";
import {
  type AccountActivity,
  type NoteAddedPayload,
  type NudgeSentPayload,
  type PaymentRecordedPayload,
  listAccountActivity,
} from "@/lib/collections/activity";
import { canEditNote } from "@/lib/collections/notes";
import { formatDate } from "@/lib/dates";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

function formatTime(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(value);
}

function paymentMethodLabel(method: string): string {
  switch (method) {
    case "check":
      return "Check";
    case "ach":
      return "ACH";
    case "card_on_file":
      return "Card on file";
    case "cash":
      return "Cash";
    default:
      return method;
  }
}

function NoteActivity({
  item,
  note,
}: {
  item: AccountActivity;
  note: { body: string; authorName: string; createdAt: Date } | undefined;
}) {
  const payload = item.payload as NoteAddedPayload;
  const createdAt = note?.createdAt ?? item.createdAt;
  const body = note?.body ?? payload.body;
  const authorName = note?.authorName ?? item.actorName;
  const editable =
    note != null && canEditNote({ authorName, createdAt }, DEMO_OPERATOR.name);

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm">
        {item.actorName}
        <span className="text-muted-foreground">
          {" "}
          · {formatDate(createdAt)} {formatTime(createdAt)}
        </span>
      </p>
      <p className="text-sm">{body}</p>
      {payload.invoiceNumber ? (
        <p className="text-sm text-muted-foreground">{payload.invoiceNumber}</p>
      ) : null}
      {editable ? <NoteEditButton key={`${payload.noteId}:${body}`} noteId={payload.noteId} body={body} /> : null}
    </div>
  );
}

function NudgeActivity({ item, plan }: { item: AccountActivity; plan: string }) {
  const payload = item.payload as NudgeSentPayload;
  const failed = item.status === "failed";

  return (
    <div className="flex flex-col gap-1">
      {failed ? (
        <p className="text-sm text-destructive">Nudge failed: {payload.reason ?? "Send failed"}</p>
      ) : (
        <p className="text-sm">Nudge sent to {payload.toEmail}</p>
      )}
      <p className={`text-sm ${failed ? "text-destructive" : "text-muted-foreground"}`}>
        {payload.invoiceNumber} · due {formatDate(payload.dueOn)} ·{" "}
        <GatedAmount cents={payload.outstandingCents} plan={plan} />
      </p>
    </div>
  );
}

function PaymentActivity({ item, plan }: { item: AccountActivity; plan: string }) {
  const payload = item.payload as PaymentRecordedPayload;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm">
        Payment recorded · {paymentMethodLabel(payload.method)} · {item.actorName}
      </p>
      <p className="text-sm text-muted-foreground">
        {payload.invoiceNumber} · <GatedAmount cents={payload.amountCents} plan={plan} />
      </p>
    </div>
  );
}

export async function ActivityFeed({ customerId, plan }: { customerId: string; plan: string }) {
  const activity = await listAccountActivity(customerId);
  if (activity.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  const notes = await prisma.collectionNote.findMany({
    where: { customerId },
    select: { id: true, body: true, authorName: true, createdAt: true },
  });
  const notesById = new Map(notes.map((note) => [note.id, note]));

  return (
    <ul className="flex flex-col divide-y divide-border">
      {activity.map((item) => (
        <li key={item.id} className="py-3 first:pt-0 last:pb-0">
          {item.type === "NOTE_ADDED" ? (
            <NoteActivity
              item={item}
              note={notesById.get((item.payload as NoteAddedPayload).noteId)}
            />
          ) : null}
          {item.type === "NUDGE_SENT" ? <NudgeActivity item={item} plan={plan} /> : null}
          {item.type === "PAYMENT_RECORDED" ? <PaymentActivity item={item} plan={plan} /> : null}
        </li>
      ))}
    </ul>
  );
}
