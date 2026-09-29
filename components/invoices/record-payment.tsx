"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/collections";
import { formatUsd } from "@/lib/money";
import { paymentMethodLabel } from "@/lib/payments";

export function RecordPayment({
  invoiceId,
  invoiceNumber,
  outstandingCents,
  disabled = false,
}: {
  invoiceId: string;
  invoiceNumber: string;
  outstandingCents: number;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "method" | "confirm">("idle");
  const [method, setMethod] = useState<PaymentMethod>(PAYMENT_METHODS[0]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (disabled) {
    return <p className="text-sm text-muted-foreground">Nothing outstanding.</p>;
  }

  function reset() {
    setStep("idle");
    setMethod(PAYMENT_METHODS[0]);
    setError(null);
  }

  function confirm() {
    setError(null);
    startTransition(async () => {
      let response: Response;
      try {
        response = await fetch(`/api/invoices/${invoiceId}/payments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method }),
        });
      } catch {
        setError("Payment could not be recorded.");
        return;
      }

      if (response.ok) {
        reset();
        router.refresh();
        return;
      }

      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(typeof body?.error === "string" ? body.error : "Payment could not be recorded.");
    });
  }

  if (step === "idle") {
    return (
      <Button type="button" onClick={() => setStep("method")}>
        Record payment
      </Button>
    );
  }

  if (step === "method") {
    return (
      <div className="space-y-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`payment-method-${invoiceId}`}>Method</Label>
          <select
            id={`payment-method-${invoiceId}`}
            value={method}
            disabled={pending}
            onChange={(event) => setMethod(event.target.value as PaymentMethod)}
            className="h-9 rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            {PAYMENT_METHODS.map((value) => (
              <option key={value} value={value}>
                {paymentMethodLabel(value)}
              </option>
            ))}
          </select>
        </div>
        <Button type="button" disabled={pending} onClick={() => setStep("confirm")}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm">
        Record {formatUsd(outstandingCents)} payment against {invoiceNumber}?
      </p>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={pending} onClick={confirm}>
          Confirm
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={reset}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
