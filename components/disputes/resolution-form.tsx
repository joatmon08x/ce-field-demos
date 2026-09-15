"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ResolveAction = "accept" | "decline";

type ResolutionFormProps = {
  disputeId: string;
  initialReviewerNote: string;
};

export function ResolutionForm({ disputeId, initialReviewerNote }: ResolutionFormProps) {
  const router = useRouter();
  const [reviewerNote, setReviewerNote] = useState(initialReviewerNote);
  const [pendingAction, setPendingAction] = useState<ResolveAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(action: ResolveAction) {
    setError(null);
    setPendingAction(action);

    const trimmed = reviewerNote.trim();
    const body: { action: ResolveAction; reviewerNote?: string } = { action };
    if (trimmed) body.reviewerNote = trimmed;

    try {
      const response = await fetch(`/api/disputes/${disputeId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        router.refresh();
        return;
      }

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Could not record the resolution.");
    } catch {
      setError("Could not reach the resolve API.");
    } finally {
      setPendingAction(null);
    }
  }

  const busy = pendingAction !== null;

  return (
    <>
      <Label htmlFor="reviewer-note">Reviewer note</Label>
      <Textarea
        id="reviewer-note"
        value={reviewerNote}
        onChange={(event) => setReviewerNote(event.target.value)}
        placeholder="Optional note for the ledger."
        disabled={busy}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={busy} onClick={() => void submit("accept")}>
          {pendingAction === "accept" ? "Accepting…" : "Accept credit"}
        </Button>
        <Button type="button" variant="outline" disabled={busy} onClick={() => void submit("decline")}>
          {pendingAction === "decline" ? "Declining…" : "Decline"}
        </Button>
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </>
  );
}
