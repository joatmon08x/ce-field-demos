import { PRODUCT } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * Router chassis with twin antennae. Keep this geometry in sync with
 * public/logo.svg, public/favicon.svg, and public/images/logo-mark.svg.
 */
export function LogoMark({
  className,
  variant = "onBrand",
}: {
  className?: string;
  variant?: "onBrand" | "onLight";
}) {
  const onBrand = variant === "onBrand";
  const chassis = onBrand ? "#ffffff" : "var(--brand)";
  const port = onBrand ? "var(--brand-mark)" : "#ffffff";
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill={onBrand ? "var(--brand-mark)" : "#ffffff"} />
      <path d="M19 27V16M45 27V16" stroke={chassis} strokeWidth="4" strokeLinecap="round" />
      <circle cx="19" cy="14" r="3" fill="var(--brand-accent)" />
      <circle cx="45" cy="14" r="3" fill="var(--brand-accent)" />
      <rect x="10" y="25" width="44" height="27" rx="8" fill={chassis} />
      {[20, 28, 36, 44].map((cx) => (
        <circle key={cx} cx={cx} cy="41" r="2.5" fill={port} />
      ))}
      <path d="M19 33h10M35 33h10" stroke="var(--brand-accent)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="size-8 shrink-0" />
      <span className="text-[17px] font-semibold tracking-tight text-foreground">{PRODUCT.name}</span>
    </span>
  );
}
