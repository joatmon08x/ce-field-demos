---
name: add-dashboard-widget
description: Add a new KPI card or panel to the Ledgerly dashboard using the existing indigo design tokens and seed data. Use when someone asks to "add a widget/card/stat to the dashboard" during a demo — it keeps the result on-brand instead of hand-rolled.
---

# Add a dashboard widget

Ship one new widget on `app/page.tsx` that looks native to the existing dashboard. Do not restyle anything else.

## Where things live

- Page: `app/page.tsx` (server component, data from `getDashboard()` in `lib/data.ts`).
- KPI primitive: `components/kpi-card.tsx` (`label`, `value`, `hint`, optional `change`, `icon`, `tone: "indigo" | "success" | "danger"`).
- Cards/tables: `components/ui/card.tsx`, `components/ui/table.tsx`. Charts: `components/charts/`.
- Tokens: CSS variables in `app/globals.css` (`--indigo`, `--success`, `--danger`, radius, shadow). Use Tailwind classes bound to them (`bg-indigo-soft`, `text-indigo`, `text-muted-foreground`). Never hard-code a new hex.

## Rules

- Data must come from the seed via Prisma (`lib/data.ts`) — compute in cents, format with `formatUsd`. No invented numbers, no fourth catalog price.
- Icons from `lucide-react`, sized `size-4` inside the tinted chip like the existing cards.
- Age or window anything with the frozen clock in `lib/clock.ts`, never `Date.now()`.
- If the KPI needs a new aggregate, add a pure helper to `lib/dashboard.ts` and a small Vitest case in `tests/dashboard.test.ts` (keep it passing — do not change `lib/disputes/suggested-credit-api.ts` or `tests/suggested-credit-api.test.ts`).

## Steps

1. Pick the metric with the user (good demo picks: "Overdue count", "Disputed dollars", "Paid this week").
2. Add/extend the aggregate in `lib/dashboard.ts` + expose it from `getDashboard()`.
3. Render one `KpiCard` (or a `Card` with a small list) in the matching grid section of `app/page.tsx`.
4. Verify at `http://127.0.0.1:43173` and run `npx eslint app components lib --max-warnings=0`.
