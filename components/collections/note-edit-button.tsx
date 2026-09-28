"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function NoteEditButton({ noteId, body }: { noteId: string; body: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(body);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Could not save the note.");
        return;
      }

      setEditing(false);
      router.refresh();
    } catch {
      setError("Could not save the note.");
    } finally {
      setPending(false);
    }
  }

  if (!editing) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>
        Edit
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        aria-label="Edit note"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div>
        <Button type="button" size="sm" onClick={save} disabled={pending}>
          Save note
        </Button>
      </div>
    </div>
  );
}
