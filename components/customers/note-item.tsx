"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

async function errorText(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: unknown };
    if (typeof data.error === "string" && data.error.trim()) return data.error;
  } catch {
    return fallback;
  }
  return fallback;
}

export function NoteItem({
  noteId,
  body,
  editable,
}: {
  noteId: string;
  body: string;
  editable: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(body);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, startTransition] = useTransition();
  const pending = submitting || refreshing;

  function save() {
    setSubmitting(true);
    setError(null);
    void (async () => {
      try {
        const response = await fetch(`/api/notes/${noteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: draft }),
        });
        if (response.ok) {
          const data = (await response.json()) as { note?: { body?: unknown } };
          if (typeof data.note?.body === "string") setDraft(data.note.body);
          setEditing(false);
          startTransition(() => {
            router.refresh();
          });
          return;
        }
        setError(await errorText(response, "Could not update the note."));
      } catch {
        setError("Could not update the note.");
      } finally {
        setSubmitting(false);
      }
    })();
  }

  if (!editing) {
    return (
      <div className="space-y-2">
        <p className="text-sm whitespace-pre-wrap">{body}</p>
        {editable ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setDraft(body);
              setError(null);
              setEditing(true);
            }}
          >
            Edit
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <Textarea value={draft} rows={3} onChange={(event) => setDraft(event.target.value)} />
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => {
            setDraft(body);
            setError(null);
            setEditing(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
