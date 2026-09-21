# Finish dispute resolution — three parallel agents

## Dispatch

Chat prompt:

```
/multitask @resolve-dispute.md
```

Use `.cursor/skills/dispatch-subagents/SKILL.md`. The parent chat **is** the coordinator. Its first Task calls are **exactly three** parallel worktrees — Agent 1 (helper), Agent 2 (API), Agent 3 (UI) below. One isolated Task per workstream. Do **not** launch a wrapper (`generalPurpose` or otherwise) whose job is “implement / execute this plan.” That agent is not in the table. Do **not** implement in the parent chat. Do **not** fan out a fourth agent to write tests or to re-dispatch the three. Each worker starts with a clean context — put owned files, the shared contract, constraints, and how to verify **in that worker’s prompt**. Do not start a sibling after another sibling “so it has context.”

**Pre-warm (coordinator, before `/multitask`):** delete leftover `components/disputes/resolution-panel.tsx` and `tests/resolve-dispute.e2e.test.ts` from a prior single-agent run. Seed so `dsp_1043` is not leftover `ACCEPTED`/`DECLINED` (`npx prisma db seed`). Ensure `npm run dev` is already Ready on **43173**. Do not pay boot + Prisma after apply.

**Run order (this plan is not done until step 4):**

1. Same turn: launch Agent 1, Agent 2, and Agent 3. Do not insert a planner or “execute this plan” Task in front of them.
2. When all three finish, summarize each worktree’s diff and apply **helper → API → UI**.
3. Same turn after apply: `ledgerly-reviewer` on the combined diff **and** `dispute-verifier` against port 43173. They do not depend on each other. Do not serialize them. Verifier writes no product code.
4. Finish line is **`dispute-verifier`**, not an e2e file. Do not skip verifier.

E2e is **optional**. If the coordinator writes `tests/resolve-dispute.e2e.test.ts`, do it in the **same turn** as reviewer + verifier (not a prior serial step) and keep it **out of** `npm test`.

The three files in `.cursor/agents/` are **not** the three implementers. There is no “implement resolve-dispute plan” agent. Map them by role:

| Role | Agent | When |
| --- | --- | --- |
| Implementer (×3) | Isolated Task workers: Agent 1, Agent 2, Agent 3 below — **only these** | Same turn, `/multitask` or “in parallel”. First Tasks in the parent. |
| Request-log worker | `api-instrumenter` | **Out of this slice.** It only adds the shared request-log helper to one named API route. Do not send it `resolve.ts` or the Resolution panel. |
| Diff review | `ledgerly-reviewer` | After apply, **same turn** as `dispute-verifier` (one review of the combined result, not one per sibling mid-flight) |
| Finish line | `dispute-verifier` | After apply, **same turn** as `ledgerly-reviewer`, against the running app on port 43173. Writes no product code. **Required.** |

Respect file ownership and the shared contract. Do not touch suggested-credit client/tests, seed, or catalog prices. API must import `resolveDispute` — do not inline Prisma persist. Mid-run 501 from UI/API is OK until the helper is applied.

Do not change 101: `npm test` stays **1 failed / 32 passed** (`tests/suggested-credit-api.test.ts` only). Do not add a red suite to the default run.

## Goal

Enable **Accept credit** and **Decline** on the dispute detail Resolution panel so a reviewer note and status persist. Cap any accepted credit with the catalog plan price. Never invent a number.

Catalog only: Starter $49, Growth $99, Scale $249 (`lib/plans.ts`). Dispute `dsp_1043` may claim $400 against a $249 Scale invoice — valid input; stored credit on accept must be **$249**, not $400.

## Testing

**During `/multitask`:** no new test files. Each agent verifies only its row (source/curl). `npm test` is the 101 planted suite — leave it alone.

**After apply:** launch `ledgerly-reviewer` and `dispute-verifier` in the **same turn**. Verifier is the finish line — it hits resolve + the page on 43173. Do not “fix” suggested-credit client/test failures in this slice. Suggested credit on the page may still be v1 **$400**.

**Optional e2e** (same turn as reviewer + verifier, not a fourth worktree, **out of** `npm test`): `tests/resolve-dispute.e2e.test.ts`. Use `dsp_tdd_*` fixtures; restore `dsp_1043` after each mutating case. Cover accept cap **24900**, decline does not raise credit, `{ action: "ACCEPTED" }` → 400, route imports `resolveDispute` with no `prisma.` persist, panel POSTs `{ action, reviewerNote }`. Skip the file if verifier already covers the live path.

| When | Check |
|---|---|
| Agent 1 done | `resolveDispute` no longer throws `not implemented`. Accept cap / decline / missing id as in the contract. |
| Agent 2 done | Bad `action` → 400. `grep`: no `prisma.` in the route. Valid body still calls `resolveDispute`. 501 until helper is applied. |
| Agent 3 done | Buttons enabled. POST body is `{ action, reviewerNote }`. 501 until helper is applied is OK. |
| After apply | Browser on `dsp_1043`. `npm test` still **1 failed / 32 passed**. **Same turn:** `ledgerly-reviewer` and **`dispute-verifier`**. Optional e2e only if written in that same turn (do not “fix” suggested-credit gates in this slice). |

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

**Apply order after the three diffs land:** helper → API → UI. Then **same turn:** `ledgerly-reviewer` and **`dispute-verifier` (required)**. Optional e2e only in that same turn, never as a serial gate before verifier.

**Out of scope for the three `/multitask` agents:** `lib/disputes/suggested-credit-api.ts`, `tests/suggested-credit-api.test.ts`, `prisma/seed.ts`, `lib/plans.ts` prices, customer email, inventing a fourth price, writing tests, a fourth worktree, a wrapper Task that implements the whole plan then (or instead of) the three, using `api-instrumenter` as a dispute-resolution worker, implementing in the parent agent instead of dispatching Agents 1–3, running `dispute-verifier` in the same turn as the three implementers (it depends on apply). Do not serialize reviewer then verifier after a clean apply.

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
