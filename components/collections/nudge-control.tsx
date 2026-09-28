import { Button } from "@/components/ui/button";

export function NudgeControl({
  invoiceId,
  invoiceNumber,
  variant,
}: {
  invoiceId: string | null;
  invoiceNumber?: string;
  variant: "account" | "row";
}) {
  const label = invoiceId ? `Nudge ${invoiceNumber ?? invoiceId}` : "Nudge";
  return (
    <Button type="button" size={variant === "row" ? "sm" : "default"} disabled>
      {label}
    </Button>
  );
}
