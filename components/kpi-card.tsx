import type { LucideIcon } from "lucide-react";
import { ClipboardList, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  change,
  icon: Icon,
  tone = "indigo",
}: {
  label: string;
  value: string;
  hint: string;
  change?: number | null;
  icon: LucideIcon;
  tone?: "indigo" | "success" | "danger";
}) {
  return (
    <Card className="gap-3 py-5">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            {label}
            <Info className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
          </p>
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              tone === "indigo" && "bg-indigo-soft text-indigo",
              tone === "success" && "bg-success-soft text-success",
              tone === "danger" && "bg-danger-soft text-danger",
            )}
          >
            <Icon className="size-4" />
          </span>
        </div>
        <p className="text-[26px] leading-none font-semibold tracking-tight">{value}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {change === undefined ? hint : <Growth change={change} suffix={hint} />}
        </p>
      </CardContent>
    </Card>
  );
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function CollectionsKpiCard({
  overdue,
  overdueCount,
  activitiesToday,
  activitiesWeek,
}: {
  overdue: string;
  overdueCount: number;
  activitiesToday: number;
  activitiesWeek: number;
}) {
  return (
    <Card className="gap-3 py-5">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            Collections
            <Info className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
          </p>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-soft text-indigo">
            <ClipboardList className="size-4" />
          </span>
        </div>
        <p className="text-[26px] leading-none font-semibold tracking-tight text-danger">{overdue}</p>
        <ul className="space-y-1 text-xs leading-relaxed">
          <li className="w-fit rounded-md bg-danger-soft px-2 py-1 font-medium text-danger">
            {countLabel(overdueCount, "overdue invoice", "overdue invoices")}
          </li>
          <li className="font-medium text-indigo">
            {countLabel(activitiesToday, "activity today", "activities today")}
          </li>
          <li className="font-medium text-indigo">
            {countLabel(activitiesWeek, "activity in the last 7 days", "activities in the last 7 days")}
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}

function Growth({ change, suffix }: { change: number | null; suffix: string }) {
  if (change === null) {
    return <span>{suffix}</span>;
  }
  const rounded = Math.round(change * 10) / 10;
  // A 10-invoice book produces wild lifts. Don't put 351% on stage.
  if (Math.abs(rounded) > 80) {
    return <span>{suffix}</span>;
  }
  const up = rounded >= 0;
  return (
    <span>
      <span className={cn("font-medium", up ? "text-success" : "text-danger")}>
        {up ? "↗" : "↘"} {up ? "+" : "−"}
        {Math.abs(rounded)}%
      </span>{" "}
      {suffix}
    </span>
  );
}
