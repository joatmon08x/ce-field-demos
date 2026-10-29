"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatUsd } from "@/lib/money";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABEL, type PaymentMethod } from "@/lib/payments";

type RecordPaymentProps = {
  invoiceId: string;
  invoiceNumber: string;
  amountCents: number;
};

export function RecordPayment({ invoiceId, invoiceNumber, amountCents }: RecordPaymentProps) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const question = `Record ${formatUsd(amountCents)} payment against ${invoiceNumber}?`;

  async function commit() {
    if (!method || pending) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const message =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Payment was not recorded.";
        setError(message);
        setPending(false);
        return;
      }
      setConfirming(false);
      setPending(false);
      router.refresh();
    } catch {
      setError("Payment was not recorded.");
      setPending(false);
    }
  }

  if (confirming && method) {
    return (
      <form
        className="space-y-3 border-t border-border pt-4"
        onSubmit={(event) => {
          event.preventDefault();
          void commit();
        }}
      >
        <p className="text-sm font-medium">{question}</p>
        <p className="text-sm text-muted-foreground">
          {PAYMENT_METHOD_LABEL[method]}. Nothing is recorded until you confirm.
        </p>
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Recording…" : "Confirm"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => {
              setConfirming(false);
              setError(null);
            }}
          >
            Back
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form
      className="space-y-3 border-t border-border pt-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!method) return;
        setError(null);
        setConfirming(true);
      }}
    >
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Method</legend>
        {PAYMENT_METHODS.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="payment-method"
              value={option}
              checked={method === option}
              onChange={() => setMethod(option)}
            />
            {PAYMENT_METHOD_LABEL[option]}
          </label>
        ))}
      </fieldset>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={!method}>
        Record payment
      </Button>
    </form>
  );
}
