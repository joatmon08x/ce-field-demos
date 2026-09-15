# Finish dispute resolution (Accept / Decline)

## Goal

Enable **Accept credit** and **Decline** on the dispute detail Resolution panel so a reviewer note and status persist. Cap any accepted credit with the catalog plan price. Never invent a number.

Catalog prices only: Starter $49, Growth $99, Scale $249 (`lib/plans.ts`). Dispute `dsp_1043` may claim $400 against a $249 Scale invoice — that claim is valid input; the stored credit on accept must cap at the plan price.

## Context

- Helper stub: `lib/disputes/resolve.ts` throws `resolveDispute is not implemented`. Imports `planPriceCents` and `suggestDisputeCredit` but does not call them.
- Route: `POST /api/disputes/[id]/resolve` already validates `action` (`accept` | `decline`) and optional `reviewerNote`. It returns 400 for a bad action and 501 until the helper succeeds.
- UI: Accept / Decline are disabled on `app/disputes/[id]/page.tsx`. The reviewer note textarea is unbound. Copy already points at the POST route and the catalog cap.
- Suggested-credit client (v1 vs v2) is a separate 101 seam — leave it alone. Do not edit `tests/suggested-credit-api.test.ts` or migrate `lib/disputes/suggested-credit-api.ts`.

## How to run this plan (dispatch-subagents)

Do **not** implement this slice in the parent chat. Use `.cursor/skills/dispatch-subagents/SKILL.md`.

Independent pieces launch in **one** parallel turn as isolated Task workers. Each worker starts with a clean context — put files, the shared contract, constraints, and how to verify **in that worker’s prompt**. Do not start a sibling after another sibling “so it has context.”

The three files in `.cursor/agents/` are **not** the three implementers. Map them by role:

| Role | Agent | When |
| --- | --- | --- |
| Implementer (×3) | Isolated Task workers, one per workstream below | Same turn, `/multitask` or “in parallel” |
| Request-log worker | `api-instrumenter` | **Out of this slice.** It only adds the shared request-log helper to one named API route. Do not send it `resolve.ts` or the Resolution panel. |
| Diff review | `ledgerly-reviewer` | After the three diffs land (one review of the combined result, not one per sibling mid-flight) |
| Finish line | `dispute-verifier` | After apply/merge, against the running app on port 43173. Writes no product code. |

Dependent work stays in order: launch the three implementers together; **apply** helper → API → UI; then reviewer; then verifier. Mid-run `501` from UI or API is expected until the helper is applied.

Each implementer prompt must include:

- Owned files only (see workstreams).
- The shared contract below.
- Constraints: no prices invented, no seed, no `lib/disputes/suggested-credit-api.ts`, no `tests/suggested-credit-api.test.ts`.
- How to verify that piece in isolation.

## Shared contract

`resolveDispute` in `lib/disputes/resolve.ts` is the only persist path.

```ts
type ResolveDisputeInput = {
  disputeId: string;
  action: "accept" | "decline";
  reviewerNote?: string;
};
```

- Accept: load dispute + invoice, cap credit with `suggestDisputeCredit` + `planPriceCents`, persist `ACCEPTED` and the optional note. Never persist a credit above the plan.
- Decline: persist `DECLINED` and the optional note. Do not invent a credit.
- API: keep importing `resolveDispute`. Do not inline Prisma persist in the route.
- UI: `POST /api/disputes/[id]/resolve` with `{ action: "accept" | "decline", reviewerNote?: string }`. Refresh so status and note show after save.
- Route already maps helper success to `{ ok: true }` (200) and unknown helper errors to 501. Leave 400 validation as-is.

## Three workstreams (parallel worktrees)

### 1. Resolve helper

- **Owns:** `lib/disputes/resolve.ts` only.
- **Does:** Implement `resolveDispute`. Load dispute + invoice. On accept, cap with `suggestDisputeCredit` + `planPriceCents`. Persist `ACCEPTED` or `DECLINED` and optional `reviewerNote`.
- **Does not:** Edit the route, the page, seed, catalog, or suggested-credit client/tests.
- **Verify:** Call the helper (or a unit of it) with `dsp_1043` / Scale $249. Accept of a $400 claim stores $249, not $400. Decline stores no invented credit. Throws nothing for a valid input.

### 2. Resolve API route

- **Owns:** `app/api/disputes/[id]/resolve/route.ts` only.
- **Does:** Keep `POST` validating `action` and optional `reviewerNote`. Call `resolveDispute`. Tighten 501 only if a real error should no longer look like “not implemented.”
- **Does not:** Inline Prisma. Do not implement the helper body here.
- **Verify:** Bad action → 400. Valid body while helper is still a stub → 501 (OK mid-run). After helper apply: `POST http://127.0.0.1:43173/api/disputes/dsp_1043/resolve` with `{ "action": "accept", "reviewerNote": "…" }` → 200 `{ ok: true }`.

### 3. Resolution panel UI

- **Owns:** `app/disputes/[id]/page.tsx` plus a small client child if the page stays a server component.
- **Does:** Bind the reviewer note. Enable Accept / Decline. POST `{ action, reviewerNote }` to the resolve route and refresh.
- **Does not:** Persist in the client. Do not migrate suggested-credit. Do not invent a displayed credit above the plan.
- **Verify:** Open `/disputes/dsp_1043`. Buttons enabled. Submit note + Accept or Decline. After helper + API are applied, status and note persist. Mid-run 501 is OK.

## Apply order (after the three finish)

1. Helper (`lib/disputes/resolve.ts`)
2. API route (`app/api/disputes/[id]/resolve/route.ts`)
3. UI (page + optional client child)
4. `ledgerly-reviewer` on the combined diff (catalog $49 / $99 / $249, seed names, stub completion was requested, suggested-credit client still v1 unless this task asked otherwise)
5. `dispute-verifier` on port 43173 (resolve POST + page; it also checks the suggested-credit gates — do not “fix” those in this slice)

Summarize each worktree’s diff. One review per task. The human still decides what ships.

## Out of scope

- Suggested-credit API client / planted $400 vs $249 display bug (v1 returns the raw claim; v2 and stored credit cap at $249).
- Seed, catalog prices, customer email feature.
- Inventing a credit above the plan price.
- Completing anything beyond this stub unless asked.
- Using `api-instrumenter` as a dispute-resolution worker.
- Implementing in the parent agent instead of dispatching.

## Files likely touched

- `lib/disputes/resolve.ts`
- `app/api/disputes/[id]/resolve/route.ts`
- `app/disputes/[id]/page.tsx` (+ small client child if needed)
