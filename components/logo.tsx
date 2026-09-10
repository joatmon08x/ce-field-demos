import { cn } from "@/lib/utils";
import { getActiveBrand, type BrandId } from "@/lib/brand";

/**
 * Brand mark. Geometry lives here and in public/brands/<id>/*.svg.
 */
function SaaslyMark({
  className,
  variant = "onIndigo",
}: {
  className?: string;
  variant?: "onIndigo" | "onLight";
}) {
  const onIndigo = variant === "onIndigo";
  const bar = onIndigo ? "#ffffff" : "#4F46E5";
  const seam = onIndigo ? "#4F46E5" : "#ffffff";
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill={onIndigo ? "#4F46E5" : "#ffffff"} />
      <path d="M36 40.5V21.8c0-1.9 1-3.6 2.7-4.4l6.3-3.2v26.3H36Z" fill="#8B85F0" />
      <path d="M44 40.5V17.4c0-1.9 1-3.6 2.7-4.4l5.3-2.7v30.2H44Z" fill="#CDC9F9" />
      <rect x="14" y="11" width="13" height="34" rx="6.5" fill={bar} />
      <rect
        x="13.25"
        y="37.25"
        width="40.5"
        height="13.5"
        rx="6.75"
        fill={bar}
        stroke={seam}
        strokeWidth="2.5"
      />
    </svg>
  );
}

function MedlyMark({
  className,
  variant = "onIndigo",
}: {
  className?: string;
  variant?: "onIndigo" | "onLight";
}) {
  const onIndigo = variant === "onIndigo";
  const fill = onIndigo ? "#0f766e" : "#ffffff";
  const ink = onIndigo ? "#ffffff" : "#0f766e";
  const accent = onIndigo ? "#99f6e4" : "#14b8a6";
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill={fill} />
      <rect x="18" y="14" width="28" height="36" rx="4" fill={ink} />
      <rect x="26" y="11" width="12" height="8" rx="2" fill={accent} />
      <rect x="24" y="28" width="16" height="3" rx="1.5" fill={fill} />
      <rect x="24" y="35" width="12" height="3" rx="1.5" fill={fill} />
      <rect x="29" y="40" width="6" height="14" rx="1.5" fill={accent} />
      <rect x="25" y="44" width="14" height="6" rx="1.5" fill={accent} />
    </svg>
  );
}

function RoutelyMark({
  className,
  variant = "onIndigo",
}: {
  className?: string;
  variant?: "onIndigo" | "onLight";
}) {
  const onIndigo = variant === "onIndigo";
  const fill = onIndigo ? "#0369a1" : "#ffffff";
  const ink = onIndigo ? "#ffffff" : "#0369a1";
  const accent = onIndigo ? "#7dd3fc" : "#0ea5e9";
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill={fill} />
      <rect x="12" y="20" width="40" height="24" rx="5" fill={ink} />
      <rect x="16" y="26" width="8" height="6" rx="1.5" fill={fill} />
      <rect x="28" y="26" width="8" height="6" rx="1.5" fill={fill} />
      <rect x="40" y="26" width="8" height="6" rx="1.5" fill={accent} />
      <rect x="16" y="36" width="28" height="3" rx="1.5" fill={fill} />
    </svg>
  );
}

const MARKS: Record<BrandId, typeof SaaslyMark> = {
  saasly: SaaslyMark,
  medly: MedlyMark,
  routely: RoutelyMark,
};

export function LogoMark({
  className,
  variant = "onIndigo",
}: {
  className?: string;
  variant?: "onIndigo" | "onLight";
}) {
  const Mark = MARKS[getActiveBrand().id];
  return <Mark className={className} variant={variant} />;
}

export function Wordmark({ className }: { className?: string }) {
  const brand = getActiveBrand();
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="size-8 shrink-0" />
      <span className="text-[17px] font-semibold tracking-tight text-foreground">
        {brand.productName}
      </span>
    </span>
  );
}
