"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function nudgeActivityStatus(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || !("activity" in payload)) return null;
  const activity = payload.activity;
  if (!activity || typeof activity !== "object" || !("status" in activity)) return null;
  return typeof activity.status === "string" ? activity.status : null;
}

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
  const [outcome, setOutcome] = useState<"sent" | "failed" | null>(null);
  const unavailable = disabled || !invoiceId;

  async function send() {
    if (unavailable || pending || !invoiceId) return;
    setPending(true);
    setError(null);
    setOutcome(null);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/nudge`, { method: "POST" });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
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
      const status = nudgeActivityStatus(payload);
      setOutcome(status === "failed" ? "failed" : "sent");
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
      {outcome === "failed" && !error ? (
        <p role="status" className="text-xs text-danger">
          Failed.
        </p>
      ) : null}
      {outcome === "sent" && !error ? (
        <p role="status" className="text-xs text-muted-foreground">
          Sent.
        </p>
      ) : null}
    </div>
  );
}
