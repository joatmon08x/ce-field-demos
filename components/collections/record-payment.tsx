"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatUsd } from "@/lib/money";

const PAYMENT_METHODS = [
  { value: "check", label: "Check" },
  { value: "ach", label: "ACH" },
  { value: "card_on_file", label: "Card on file" },
  { value: "cash", label: "Cash" },
] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export function RecordPayment({
  invoiceId,
  invoiceNumber,
  outstandingCents,
  status,
}: {
  invoiceId: string;
  invoiceNumber: string;
  outstandingCents: number;
  status: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"closed" | "method" | "confirm">("closed");
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (status === "PAID" || outstandingCents === 0) {
    return null;
  }

  function cancel() {
    setStep("closed");
    setMethod(null);
    setError(null);
  }

  async function confirm() {
    if (!method || pending) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(body?.error ?? "Payment could not be recorded.");
        return;
      }
      setStep("closed");
      setMethod(null);
      router.refresh();
    } catch {
      setError("Payment could not be recorded.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      {step === "closed" ? (
        <Button type="button" onClick={() => setStep("method")}>
          Record payment
        </Button>
      ) : null}

      {step === "method" ? (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Payment method</legend>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`payment-method-${invoiceId}`}
                  value={option.value}
                  checked={method === option.value}
                  onChange={() => setMethod(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" disabled={method === null} onClick={() => setStep("confirm")}>
              Continue
            </Button>
            <Button type="button" variant="outline" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </fieldset>
      ) : null}

      {step === "confirm" ? (
        <div className="space-y-3">
          <p className="text-sm">
            Record {formatUsd(outstandingCents)} payment against {invoiceNumber}?
          </p>
          <div className="flex gap-2">
            <Button type="button" disabled={pending} onClick={() => void confirm()}>
              Confirm
            </Button>
            <Button type="button" variant="outline" disabled={pending} onClick={cancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
