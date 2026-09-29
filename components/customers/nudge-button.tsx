"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

async function errorText(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: unknown };
    if (typeof data.error === "string" && data.error.trim()) return data.error;
  } catch {
    return fallback;
  }
  return fallback;
}

export function NudgeButton({
  invoiceId,
  disabled = false,
  size = "sm",
}: {
  invoiceId?: string;
  disabled?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, startTransition] = useTransition();
  const [result, setResult] = useState<"sent" | "failed" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pending = submitting || refreshing;
  const unavailable = disabled || !invoiceId;

  function send() {
    if (unavailable || !invoiceId) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    void (async () => {
      try {
        const response = await fetch(`/api/invoices/${invoiceId}/nudge`, { method: "POST" });
        if (response.status !== 200) {
          setError(await errorText(response, "Nudge did not send."));
          return;
        }
        const data = (await response.json()) as { status?: unknown };
        if (data.status === "sent" || data.status === "failed") setResult(data.status);
        startTransition(() => {
          router.refresh();
        });
      } catch {
        setError("Nudge did not send.");
      } finally {
        setSubmitting(false);
      }
    })();
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Button type="button" size={size} disabled={unavailable || pending} onClick={send}>
        {pending ? "Sending…" : "Nudge"}
      </Button>
      {result === "sent" ? (
        <span className="rounded-md bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
          Sent
        </span>
      ) : null}
      {result === "failed" ? (
        <span className="rounded-md bg-danger-soft px-2 py-0.5 text-xs font-medium text-danger">
          Failed
        </span>
      ) : null}
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </span>
  );
}
