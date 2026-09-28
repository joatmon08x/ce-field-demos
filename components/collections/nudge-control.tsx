"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type NudgeNotice = { kind: "sent" } | { kind: "failed"; reason: string };

export function NudgeControl({
  invoiceId,
  variant,
}: {
  invoiceId: string | null;
  invoiceNumber?: string;
  variant: "account" | "row";
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<NudgeNotice | null>(null);
  const unavailable = invoiceId === null;

  async function send() {
    if (!invoiceId || pending) return;
    setPending(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/nudge`, { method: "POST" });
      const body = (await response.json()) as {
        status?: "sent" | "failed";
        reason?: string;
        error?: string;
      };
      if (response.ok && body.status === "sent") {
        setNotice({ kind: "sent" });
      } else {
        setNotice({
          kind: "failed",
          reason: body.reason ?? body.error ?? "nudge failed",
        });
      }
      router.refresh();
    } catch {
      setNotice({ kind: "failed", reason: "nudge failed" });
    } finally {
      setPending(false);
    }
  }

  return (
    <span
      className="inline-flex items-center gap-2"
      title={unavailable ? "No overdue invoices" : undefined}
    >
      <Button
        type="button"
        size={variant === "row" ? "sm" : "default"}
        variant={variant === "row" ? "outline" : "default"}
        disabled={unavailable || pending}
        title={unavailable ? "No overdue invoices" : undefined}
        onClick={() => {
          void send();
        }}
      >
        Nudge
      </Button>
      {pending ? (
        <span className="text-xs text-muted-foreground">Sending...</span>
      ) : notice?.kind === "sent" ? (
        <span className="text-xs text-muted-foreground">Sent</span>
      ) : notice?.kind === "failed" ? (
        <span className="text-xs text-destructive">Failed: {notice.reason}</span>
      ) : null}
    </span>
  );
}
