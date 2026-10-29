"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEMO_OPERATOR } from "@/lib/demo-session";

type InvoiceOption = { id: string; number: string };

export function SaveCollectionNote({
  customerId,
  invoices,
}: {
  customerId: string;
  invoices: readonly InvoiceOption[];
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (pending) return;
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
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const message =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Note was not saved.";
        setError(message);
        setPending(false);
        return;
      }
      setBody("");
      setInvoiceId("");
      setPending(false);
      router.refresh();
    } catch {
      setError("Note was not saved.");
      setPending(false);
    }
  }

  return (
    <section aria-labelledby="collection-note-heading" className="flex flex-col gap-3">
      <div className="space-y-1">
        <h2 id="collection-note-heading" className="text-lg font-semibold tracking-tight">
          Collection note
        </h2>
        <p className="text-sm text-muted-foreground">
          Promise to pay or dispute context, saved on this account. {DEMO_OPERATOR.name} is the author.
        </p>
      </div>
      <Card>
        <CardContent>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="account-collection-note">Note</Label>
              <Textarea
                id="account-collection-note"
                name="body"
                rows={4}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="What the account said, or the promise to pay."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-collection-note-invoice">Invoice</Label>
              <select
                id="account-collection-note-invoice"
                name="invoiceId"
                value={invoiceId}
                onChange={(event) => setInvoiceId(event.target.value)}
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
              >
                <option value="">No invoice</option>
                {invoices.map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.number}
                  </option>
                ))}
              </select>
            </div>
            {error ? (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            ) : null}
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save note"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
