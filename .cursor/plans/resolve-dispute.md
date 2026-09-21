# Finish dispute resolution — three parallel agents

## Dispatch

```
/multitask @resolve-dispute.md
```

Use `.cursor/skills/dispatch-subagents/SKILL.md`. **Exactly three** isolated Task workers in one turn — one worktree per workstream below. Do **not** implement in the parent. Do **not** launch a fourth worker (no tests agent, no `api-instrumenter`, no `ledgerly-reviewer`, no `dispute-verifier`). Put owned files, the contract, and verify steps **in that worker’s prompt**.

When all three finish, summarize each worktree and apply **helper → API → UI**. Coordinator may add `tests/resolve-dispute.e2e.test.ts` (keep it **out of** `npm test`). Stop there.

`npm test` stays **1 failed / 32 passed** (`tests/suggested-credit-api.test.ts` only).

## Goal

Enable **Accept credit** and **Decline** so a reviewer note and status persist. Cap accepted credit at the catalog plan price. Never invent a number.

Catalog: Starter $49, Growth $99, Scale $249 (`lib/plans.ts`). `dsp_1043` may claim $400 against Scale — stored accept credit is **$249** (24900 cents), not $400.

## Contract (do not fork)

```ts
{ disputeId: string; action: "accept" | "decline"; reviewerNote?: string }
```

`POST /api/disputes/[id]/resolve` — body as above. 400 if `action` is missing or not `accept`/`decline`: `{ error: "action must be accept or decline" }`. 200: `{ ok: true }`. Helper throw: 501 until the helper is real. `action` is not `ACCEPTED`/`DECLINED`.

Persist **only in the helper** (Prisma from `@/lib/prisma`): `accept` → `ACCEPTED`, `decline` → `DECLINED`, save optional `reviewerNote`. On accept only: `suggestedCreditCents = suggestDisputeCredit({ disputedAmountCents, planPriceCents: planPriceCents(invoice.plan) })`. Never persist above the plan.

Out of scope: suggested-credit client/tests, seed, catalog prices, customer email, a fourth price, tests during `/multitask`, parent-chat implementation.

Mid-run 501 from UI/API is OK until the helper is applied. File overlap should be none; a conflict means a sibling edited the wrong file — revert that hunk.

## Agents

### 1 — helper — `lib/disputes/resolve.ts` only

Implement `resolveDispute`. Load dispute + invoice. Cap accept. Persist status + note (+ capped cents on accept).

**Verify:** no `not implemented` throw. $400 Scale accept → **24900** cents. Decline → `DECLINED`, credit not raised. Missing id throws.

### 2 — API — `app/api/disputes/[id]/resolve/route.ts` only

Keep `import { resolveDispute } from "@/lib/disputes/resolve"`. Call with `{ disputeId: id, action, reviewerNote }`. No Prisma. Leave 400 validation. Success `{ ok: true }`.

**Verify:** bad `action` → 400. No `prisma.` in the file. Valid body still calls `resolveDispute`. 501 before helper apply is OK.

### 3 — UI — `app/disputes/[id]/page.tsx` + optional client child (`components/disputes/resolution-panel.tsx`)

Enable Accept / Decline. POST `{ action, reviewerNote }` to `/api/disputes/{id}/resolve`. Refresh so badge + note show. Do not call `resolveDispute` from the client. Do not invent a credit. Suggested-credit display may still be v1 **$400**.

**Verify:** buttons enabled; note in the POST body.

## After apply (coordinator, not a worker)

Optional e2e (exclude from `npm test`): accept cap 24900, decline does not raise credit, `ACCEPTED` → 400, route imports helper and has no `prisma.`, panel POSTs `{ action, reviewerNote }`. Use `dsp_tdd_*`; restore `dsp_1043`. Browser: `/disputes/dsp_1043` Accept or Decline with a note. Do not migrate suggested-credit v1→v2.
