# Finish dispute resolution — three parallel agents

## Dispatch

Chat prompt:

```
/multitask @resolve-dispute.md
```

Three parallel worktrees, one agent per workstream below. Respect file ownership and the shared contract. Do not touch suggested-credit client/tests, seed, or catalog prices. API must import `resolveDispute` — do not inline Prisma persist. Mid-run 501 from UI/API is OK until the helper is applied. When all three finish, summarize each worktree’s diff and the apply order: helper → API → UI. Run `npm run test:resolve` on the combined tree.

## Goal

Enable **Accept credit** and **Decline** on the dispute detail Resolution panel so a reviewer note and status persist. Cap any accepted credit with the catalog plan price. Never invent a number.

Catalog only: Starter $49, Growth $99, Scale $249 (`lib/plans.ts`). Dispute `dsp_1043` may claim $400 against a $249 Scale invoice — valid input; stored credit on accept must be **$249**, not $400.

## Testing

TDD fixtures live in `tests/resolve-dispute/`. They are **red until this slice lands**. They are excluded from `npm test` so the planted suggested-credit failure stays the sole shipped red (`1 failed / 45 passed`).

```bash
npx prisma db seed   # once, if prisma/dev.db is empty
npm run test:resolve
```

Per worktree, only that agent’s file. After apply (helper → API → UI): the whole folder green. Do not migrate suggested-credit v1→v2. Do not edit these tests to force green. Fixtures use `dsp_tdd_*` ids and restore `dsp_1043` after each mutating case.

| Agent | Command | Pass |
|---|---|---|
| Helper | `npx vitest run --config vitest.resolve.config.ts tests/resolve-dispute/helper.test.ts` | `accept` on a $400 Scale claim stores **24900** cents, note, `ACCEPTED`. Decline → `DECLINED`, credit not raised. Missing id throws `/not found/i`. |
| API | `npx vitest run --config vitest.resolve.config.ts tests/resolve-dispute/route.test.ts` | Bad `action` (`ACCEPTED`) → 400. File imports `resolveDispute`, no `prisma`. Throw from helper is not 200. The **200 `{ ok: true }` + persist** case stays red until the helper worktree is applied. |
| UI | `npx vitest run --config vitest.resolve.config.ts tests/resolve-dispute/panel.test.ts` | Accept/Decline enabled (no “Not wired” stub). Source POSTs `{ action, reviewerNote }` to `/api/disputes/.../resolve`. No `resolveDispute` / Prisma in the panel. |
| Combined | `npm run test:resolve` | Helper + route 200 + panel + `ownership.test.ts` (disjoint persist). |

`npm test` remains **1 failed / 45 passed**. Suggested credit on `/disputes/dsp_1043` may still be v1 **$400**.

## Conflicts

File overlap should be none. Open the three worktree diffs to show disjoint paths, then apply helper → API → UI.

Runtime 501 from UI/API before the helper is applied is expected. `ownership.test.ts` fails if the route or panel inlines Prisma persist.

A git conflict means an agent edited a sibling’s file — revert that hunk and keep ownership.

Contract miss: `action` must be `accept` \| `decline`, not `ACCEPTED` \| `DECLINED` (the route 400 case).

## Shared contract (do not fork)

**`resolveDispute` input** (already exported from `lib/disputes/resolve.ts`):

```ts
{ disputeId: string; action: "accept" | "decline"; reviewerNote?: string }
```

**HTTP** — `POST /api/disputes/[id]/resolve`

- Body: `{ action: "accept" | "decline", reviewerNote?: string }`
- 400 if `action` is missing or not `accept`/`decline`: `{ error: "action must be accept or decline" }`
- 200 on helper success: `{ ok: true }`
- Helper throw: 501 until the helper is real; do not treat “not implemented” as success

**Persist (helper only, via Prisma — never in the route):**

- `accept` → status `ACCEPTED`; `decline` → `DECLINED`
- Save optional `reviewerNote`
- On accept only: `suggestedCreditCents = suggestDisputeCredit({ disputedAmountCents, planPriceCents: planPriceCents(invoice.plan) })`
- Do not persist a credit above the plan

**Apply order after the three diffs land:** helper → API → UI.

**Out of scope for every agent:** `lib/disputes/suggested-credit-api.ts`, `tests/suggested-credit-api.test.ts`, `prisma/seed.ts`, `lib/plans.ts` prices, customer email, inventing a fourth price, editing `tests/resolve-dispute/` to force green.

Mid-run **501** from UI or API is expected until the helper worktree is applied.

---

### Agent 1 — resolve helper

| | |
|---|---|
| **Owns** | `lib/disputes/resolve.ts` only |
| **Does not own** | route, page, seed, suggested-credit client/tests, `tests/resolve-dispute/` |
| **Contract** | Implement `resolveDispute`. Load dispute + invoice. Cap accept with `suggestDisputeCredit` + `planPriceCents`. Persist status + note (+ capped cents on accept). Import `prisma` from `@/lib/prisma` here — persist lives in this file. |
| **Verify** | `npx vitest run --config vitest.resolve.config.ts tests/resolve-dispute/helper.test.ts` |

---

### Agent 2 — resolve API route

| | |
|---|---|
| **Owns** | `app/api/disputes/[id]/resolve/route.ts` only |
| **Does not own** | helper Prisma, UI, `tests/resolve-dispute/` |
| **Contract** | Keep `import { resolveDispute } from "@/lib/disputes/resolve"`. Call it with `{ disputeId: id, action, reviewerNote }`. **Do not inline Prisma persist.** Leave 400 validation as-is. Success stays `{ ok: true }`. Optionally map real helper errors so “not implemented” is 501 and a missing dispute is not a fake 200. |
| **Verify** | `npx vitest run --config vitest.resolve.config.ts tests/resolve-dispute/route.test.ts` — contract cases green now; 200 persist red until helper is applied. |

---

### Agent 3 — Resolution panel UI

| | |
|---|---|
| **Owns** | `app/disputes/[id]/page.tsx` + a small client child if the page stays a server component (e.g. `components/disputes/resolution-panel.tsx`) |
| **Does not own** | helper, route internals, `SuggestedCredit` / v1 client, `tests/resolve-dispute/` |
| **Contract** | Enable Accept / Decline. Bind the reviewer note. `POST` `{ action, reviewerNote }` to `/api/disputes/{id}/resolve`. Refresh so status badge and note show after save. Do not call `resolveDispute` from the client. Do not invent a credit in the UI. |
| **Verify** | `npx vitest run --config vitest.resolve.config.ts tests/resolve-dispute/panel.test.ts` |
