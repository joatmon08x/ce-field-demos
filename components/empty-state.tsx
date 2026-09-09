import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  body,
  imageSrc,
  imageAlt,
  action,
  className,
}: {
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-border bg-card px-6 py-14 text-center",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageSrc} alt={imageAlt} width={240} height={160} className="h-40 w-60 rounded-xl object-cover" />
      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
      {action}
    </div>
  );
}
