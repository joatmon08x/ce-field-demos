"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

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
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/customers/${customerId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          ...(invoiceId ? { invoiceId } : {}),
        }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        if (response.status === 400) {
          setError(payload.error ?? "Note cannot be blank.");
        } else {
          setError(payload.error ?? "Could not save the note.");
        }
        return;
      }

      setBody("");
      setInvoiceId("");
      router.refresh();
    } catch {
      setError("Could not save the note.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a note</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Promise to pay, dispute context, or a follow-up."
            aria-label="Note"
            name="body"
          />
          <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground">
            Invoice
            <select
              name="invoiceId"
              value={invoiceId}
              onChange={(event) => setInvoiceId(event.target.value)}
              aria-label="Invoice"
              className="h-9 rounded-md border border-input bg-card px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              <option value="">No invoice</option>
              {invoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.number}
                </option>
              ))}
            </select>
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div>
            <Button type="submit" disabled={pending}>
              Save note
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
