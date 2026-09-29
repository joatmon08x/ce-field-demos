"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

export function NoteComposer({
  customerId,
  invoices,
}: {
  customerId: string;
  invoices: { id: string; number: string }[];
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, startTransition] = useTransition();
  const pending = submitting || refreshing;

  function save() {
    setSubmitting(true);
    setError(null);
    const payload: { body: string; invoiceId?: string } = { body };
    if (invoiceId) payload.invoiceId = invoiceId;

    void (async () => {
      try {
        const response = await fetch(`/api/customers/${customerId}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (response.status === 201) {
          setBody("");
          setInvoiceId("");
          startTransition(() => {
            router.refresh();
          });
          return;
        }
        setError(await errorText(response, "Could not save the note."));
      } catch {
        setError("Could not save the note.");
      } finally {
        setSubmitting(false);
      }
    })();
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="collection-note">Note</Label>
        <Textarea
          id="collection-note"
          value={body}
          rows={4}
          placeholder="Promise to pay, dispute context, or a follow-up."
          onChange={(event) => setBody(event.target.value)}
        />
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="tie-invoice">Tie to invoice</Label>
        <select
          id="tie-invoice"
          value={invoiceId}
          onChange={(event) => setInvoiceId(event.target.value)}
          className="h-9 w-full max-w-xs rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <option value="">None</option>
          {invoices.map((invoice) => (
            <option key={invoice.id} value={invoice.id}>
              {invoice.number}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save note"}
      </Button>
    </form>
  );
}
