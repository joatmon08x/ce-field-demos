"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ResolveAction = "accept" | "decline";

type ResolutionFormProps = {
  disputeId: string;
  initialReviewerNote?: string | null;
};

export function ResolutionForm({ disputeId, initialReviewerNote }: ResolutionFormProps) {
  const router = useRouter();
  const [reviewerNote, setReviewerNote] = useState(initialReviewerNote ?? "");
  const [pendingAction, setPendingAction] = useState<ResolveAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    setReviewerNote(initialReviewerNote ?? "");
    setPendingAction(null);
    setError(null);
    setHint(null);
  }, [disputeId, initialReviewerNote]);

  async function submit(action: ResolveAction) {
    setPendingAction(action);
    setError(null);
    setHint(null);

    const trimmed = reviewerNote.trim();
    const body: { action: ResolveAction; reviewerNote?: string } = { action };
    if (trimmed) body.reviewerNote = trimmed;

    try {
      const response = await fetch(`/api/disputes/${encodeURIComponent(disputeId)}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        hint?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? `Resolve request failed (${response.status}).`);
        setHint(payload.hint ?? null);
        return;
      }

      router.refresh();
    } catch {
      setError("Could not reach the resolve endpoint.");
    } finally {
      setPendingAction(null);
    }
  }

  const busy = pendingAction !== null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="reviewer-note">Reviewer note</Label>
        <Textarea
          id="reviewer-note"
          value={reviewerNote}
          onChange={(event) => setReviewerNote(event.target.value)}
          placeholder="Optional note stored with the decision."
          disabled={busy}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={busy} onClick={() => void submit("accept")}>
          {pendingAction === "accept" ? "Accepting…" : "Accept credit"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => void submit("decline")}
        >
          {pendingAction === "decline" ? "Declining…" : "Decline"}
        </Button>
      </div>
      {error ? (
        <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
          {error}
          {hint ? <span className="mt-1 block text-xs">{hint}</span> : null}
        </p>
      ) : null}
    </div>
  );
}
