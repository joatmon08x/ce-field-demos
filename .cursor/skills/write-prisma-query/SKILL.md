---
name: write-prisma-query
description: Write a correct Prisma query against Ledgerly's seeded SQLite database. Use when someone asks to pull, count, or aggregate invoices, disputes, or customers from the demo seed — e.g. "which invoices are overdue" or "total open receivables".
---

# Write a Prisma query for Ledgerly

Produce a query that runs against this repo's real schema and seed, not a generic Prisma example.

## Ground rules

- Schema: `prisma/schema.prisma`. Client singleton: import `prisma` from `@/lib/prisma` (server code only).
- All money is **integer cents** (`totalCents`, `disputedAmountCents`). Format for humans with `formatUsd` from `@/lib/money`. Never introduce floats or a price outside $49/$99/$249.
- Statuses are strings validated by `lib/status.ts`: invoices `DRAFT | OPEN | PAID | OVERDUE | VOID`, disputes `OPEN | NEEDS_REVIEW | ACCEPTED | DECLINED`.
- "Today" is the frozen demo clock: import `DEMO_AS_OF` from `@/lib/clock` (23 Aug 2026). Never use `new Date()` for aging.
- IDs look like `inv_1043`, `dsp_1043`, `cus_harborline`. Single workspace: `ws_fieldnote`.
- Existing query helpers live in `lib/data.ts` — extend that file rather than scattering `prisma.` calls inside components.

## Recipe

1. Restate what rows and columns the user wants.
2. Write the query with `include`/`select` kept minimal, ordered deterministically (`orderBy`), and typed by inference (no `any`).
3. If it is for a page or API route, put it in `lib/data.ts` and call it from the server component or route handler.
4. Show how to verify: either a one-off `npx tsx` snippet or hitting an existing API route such as `curl http://127.0.0.1:43173/api/invoices?status=OVERDUE`.

## Example shape

```ts
export async function getOverdueTotalCents() {
  const overdue = await prisma.invoice.findMany({
    where: { status: "OVERDUE" },
    select: { totalCents: true },
  });
  return sumCents(overdue.map((invoice) => invoice.totalCents));
}
```
