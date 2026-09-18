# Finish dispute resolution — three parallel agents

## Dispatch

Chat prompt:

```
/multitask @resolve-dispute.md
```

Use `.cursor/skills/dispatch-subagents/SKILL.md`. **Exactly three** parallel worktrees — one isolated Task worker per workstream below. Do **not** implement in the parent chat. Do **not** fan out a fourth agent to write tests. Each worker starts with a clean context — put owned files, the shared contract, constraints, and how to verify **in that worker’s prompt**. Do not start a sibling after another sibling “so it has context.”

The three files in `.cursor/agents/` are **not** the three implementers. Map them by role:

| Role | Agent | When |
| --- | --- | --- |
| Implementer (×3) | Isolated Task workers, one per workstream below | Same turn, `/multitask` or “in parallel” |
| Request-log worker | `api-instrumenter` | **Out of this slice.** It only adds the shared request-log helper to one named API route. Do not send it `resolve.ts` or the Resolution panel. |
| Diff review | `ledgerly-reviewer` | After the three diffs land (one review of the combined result, not one per sibling mid-flight) |
| Finish line | `dispute-verifier` | After apply/merge, against the running app on port 43173. Writes no product code. |

Respect file ownership and the shared contract. Do not touch suggested-credit client/tests, seed, or catalog prices. API must import `resolveDispute` — do not inline Prisma persist. Mid-run 501 from UI/API is OK until the helper is applied. When all three finish, summarize each worktree’s diff and the apply order: helper → API → UI. Then `ledgerly-reviewer`, then `dispute-verifier`.

End-to-end tests are a **sequential completion step** after those diffs are applied — not part of `/multitask`.

Do not change 101: `npm test` stays **1 failed / 31 passed** (`tests/suggested-credit-api.test.ts` only). Do not add a red suite to the default run.

## Goal

Enable **Accept credit** and **Decline** on the dispute detail Resolution panel so a reviewer note and status persist. Cap any accepted credit with the catalog plan price. Never invent a number.

Catalog only: Starter $49, Growth $99, Scale $249 (`lib/plans.ts`). Dispute `dsp_1043` may claim $400 against a $249 Scale invoice — valid input; stored credit on accept must be **$249**, not $400.

## Testing

**During `/multitask`:** no new test files. Each agent verifies only its row (source/curl). `npm test` is the 101 planted suite — leave it alone.

**After apply (coordinator or a follow-up, not a fourth worktree):** add one end-to-end file, e.g. `tests/resolve-dispute.e2e.test.ts`, and keep it **out of** `npm test` (exclude it, or run it with an explicit path). Use `dsp_tdd_*` fixtures; restore `dsp_1043` after each mutating case. Do not migrate suggested-credit v1→v2.

The e2e file should cover:

- `POST` `{ action: "accept", reviewerNote }` on a $400 Scale claim → 200 `{ ok: true }`, status `ACCEPTED`, stored credit **24900** cents, note saved
- `POST` decline → `DECLINED`, credit not raised
- `POST` `{ action: "ACCEPTED" }` → 400 `{ error: "action must be accept or decline" }`
- Route still imports `resolveDispute` and has no `prisma.` persist
- Panel POSTs `{ action, reviewerNote }` (optional source check)

Then open `/disputes/dsp_1043`, Accept or Decline with a note, confirm status + note persist. Suggested credit on the page may still be v1 **$400**.

| When | Check |
|---|---|
| Agent 1 done | `resolveDispute` no longer throws `not implemented`. Accept cap / decline / missing id as in the contract. |
| Agent 2 done | Bad `action` → 400. `grep`: no `prisma.` in the route. Valid body still calls `resolveDispute`. 501 until helper is applied. |
| Agent 3 done | Buttons enabled. POST body is `{ action, reviewerNote }`. 501 until helper is applied is OK. |
| After apply | Write + run the e2e file above. Browser on `dsp_1043`. `npm test` still **1 failed / 31 passed**. `ledgerly-reviewer` then `dispute-verifier` (do not “fix” suggested-credit gates in this slice). |

## Conflicts

File overlap should be none. Open the three worktree diffs to show disjoint paths, then apply helper → API → UI.

Runtime 501 from UI/API before the helper is applied is expected.

A git conflict means an agent edited a sibling’s file — revert that hunk and keep ownership.

Contract miss: `action` must be `accept` \| `decline`, not `ACCEPTED` \| `DECLINED`.

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

**Apply order after the three diffs land:** helper → API → UI. Then the e2e file. Then `ledgerly-reviewer`. Then `dispute-verifier`.

**Out of scope for the three `/multitask` agents:** `lib/disputes/suggested-credit-api.ts`, `tests/suggested-credit-api.test.ts`, `prisma/seed.ts`, `lib/plans.ts` prices, customer email, inventing a fourth price, writing tests, a fourth worktree, using `api-instrumenter` as a dispute-resolution worker, implementing in the parent agent instead of dispatching.

Mid-run **501** from UI or API is expected until the helper worktree is applied.

---

### Agent 1 — resolve helper

| | |
|---|---|
| **Owns** | `lib/disputes/resolve.ts` only |
| **Does not own** | route, page, seed, suggested-credit client/tests, tests |
| **Contract** | Implement `resolveDispute`. Load dispute + invoice. Cap accept with `suggestDisputeCredit` + `planPriceCents`. Persist status + note (+ capped cents on accept). Import `prisma` from `@/lib/prisma` here — persist lives in this file. |
| **Verify** | Function no longer throws `resolveDispute is not implemented`. For a $400 Scale claim + `accept`, stored credit is **24900** cents, not 40000. Decline sets `DECLINED` and does not raise the credit. Missing id should throw (route may map it). |

---

### Agent 2 — resolve API route

| | |
|---|---|
| **Owns** | `app/api/disputes/[id]/resolve/route.ts` only |
| **Does not own** | helper Prisma, UI, tests |
| **Contract** | Keep `import { resolveDispute } from "@/lib/disputes/resolve"`. Call it with `{ disputeId: id, action, reviewerNote }`. **Do not inline Prisma persist.** Leave 400 validation as-is. Success stays `{ ok: true }`. Optionally map real helper errors so “not implemented” is 501 and a missing dispute is not a fake 200. |
| **Verify** | Bad `action` → 400. Valid body still calls `resolveDispute` (grep: no `prisma.` in this file). After helper is applied: `POST /api/disputes/dsp_1043/resolve` with `{ "action": "accept", "reviewerNote": "…" }` → 200 `{ ok: true }`. Before helper: 501 is OK. |

---

### Agent 3 — Resolution panel UI

| | |
|---|---|
| **Owns** | `app/disputes/[id]/page.tsx` + a small client child if the page stays a server component (e.g. `components/disputes/resolution-panel.tsx`) |
| **Does not own** | helper, route internals, `SuggestedCredit` / v1 client, tests |
| **Contract** | Enable Accept / Decline. Bind the reviewer note. `POST` `{ action, reviewerNote }` to `/api/disputes/{id}/resolve`. Refresh so status badge and note show after save. Do not call `resolveDispute` from the client. Do not invent a credit in the UI. |
| **Verify** | Buttons are enabled. Note is in the POST body. After helper+API apply: on `/disputes/dsp_1043`, Accept or Decline with a note, reload — status and note persist. Suggested-credit display may still be v1 **$400**; do not “fix” that here. |
