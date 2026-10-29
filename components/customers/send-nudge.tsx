"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type SendNudgeProps = {
  invoiceId: string | null;
  invoiceNumber: string | null;
  disabled?: boolean;
  describedBy?: string;
  scope: "account" | "invoice";
  variant?: "default" | "outline";
  size?: "default" | "sm";
};

export function SendNudge({
  invoiceId,
  invoiceNumber,
  disabled = false,
  describedBy,
  scope,
  variant = "default",
  size = "default",
}: SendNudgeProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const unavailable = disabled || !invoiceId;

  async function send() {
    if (unavailable || pending || !invoiceId) return;
    setPending(true);
    setError(null);
    setSent(false);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/nudge`, { method: "POST" });
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const message =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Nudge was not sent.";
        setError(message);
        setPending(false);
        return;
      }
      setSent(true);
      setPending(false);
      router.refresh();
    } catch {
      setError("Nudge was not sent.");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={unavailable || pending}
        aria-describedby={describedBy}
        aria-label={invoiceNumber ? `Nudge ${invoiceNumber}` : "Nudge"}
        data-nudge-scope={scope}
        data-nudge-invoice={invoiceId ?? undefined}
        onClick={() => {
          void send();
        }}
      >
        {pending ? "Sending…" : "Nudge"}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      {sent && !error ? (
        <p role="status" className="text-xs text-muted-foreground">
          Sent.
        </p>
      ) : null}
    </div>
  );
}
