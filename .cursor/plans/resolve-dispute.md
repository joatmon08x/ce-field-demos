# Finish dispute resolution — three parallel agents

## Goal

Enable **Accept credit** and **Decline** on the dispute detail Resolution panel so a reviewer note and status persist. Cap any accepted credit with the catalog plan price. Never invent a number.

Catalog only: Starter $49, Growth $99, Scale $249 (`lib/plans.ts`). Dispute `dsp_1043` may claim $400 against a $249 Scale invoice — valid input; stored credit on accept must be **$249**, not $400.

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

**Out of scope for every agent:** `lib/disputes/suggested-credit-api.ts`, `tests/suggested-credit-api.test.ts`, `prisma/seed.ts`, `lib/plans.ts` prices, customer email, inventing a fourth price.

Mid-run **501** from UI or API is expected until the helper worktree is applied.

---

### Agent 1 — resolve helper

| | |
|---|---|
| **Owns** | `lib/disputes/resolve.ts` only |
| **Does not own** | route, page, seed, suggested-credit client/tests |
| **Contract** | Implement `resolveDispute`. Load dispute + invoice. Cap accept with `suggestDisputeCredit` + `planPriceCents`. Persist status + note (+ capped cents on accept). Import `prisma` from `@/lib/prisma` here — persist lives in this file. |
| **Verify** | Function no longer throws `resolveDispute is not implemented`. For `dsp_1043` + `accept`, stored credit is **24900** cents (Scale), not 40000. Decline sets `DECLINED` and does not raise the credit. Missing id should throw (route may map it). |

---

### Agent 2 — resolve API route

| | |
|---|---|
| **Owns** | `app/api/disputes/[id]/resolve/route.ts` only |
| **Does not own** | helper Prisma, UI |
| **Contract** | Keep `import { resolveDispute } from "@/lib/disputes/resolve"`. Call it with `{ disputeId: id, action, reviewerNote }`. **Do not inline Prisma persist.** Leave 400 validation as-is. Success stays `{ ok: true }`. Optionally map real helper errors so “not implemented” is 501 and a missing dispute is not a fake 200. |
| **Verify** | Bad `action` → 400. Valid body still calls `resolveDispute` (grep: no `prisma.` in this file). After helper is applied: `POST /api/disputes/dsp_1043/resolve` with `{ "action": "accept", "reviewerNote": "…" }` → 200 `{ ok: true }`. Before helper: 501 is OK. |

---

### Agent 3 — Resolution panel UI

| | |
|---|---|
| **Owns** | `app/disputes/[id]/page.tsx` + a small client child if the page stays a server component (e.g. `components/disputes/resolution-panel.tsx`) |
| **Does not own** | helper, route internals, `SuggestedCredit` / v1 client |
| **Contract** | Enable Accept / Decline. Bind the reviewer note. `POST` `{ action, reviewerNote }` to `/api/disputes/{id}/resolve`. Refresh so status badge and note show after save. Do not call `resolveDispute` from the client. Do not invent a credit in the UI. |
| **Verify** | Buttons are enabled. Note is in the POST body. After helper+API apply: on `/disputes/dsp_1043`, Accept or Decline with a note, reload — status and note persist. Suggested-credit display may still be v1 **$400**; do not “fix” that here. |
