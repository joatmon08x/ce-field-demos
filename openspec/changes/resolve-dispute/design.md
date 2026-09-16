## Context

Three files are unfinished on purpose. They already share a contract: `ResolveDisputeInput` is `{ disputeId, action: "accept" | "decline", reviewerNote?: string }`. The route already rejects any other `action` with 400. The helper throws `resolveDispute is not implemented`. The panel buttons are disabled.

Catalog prices live in `lib/plans.ts`. Accept MUST call `suggestDisputeCredit` with `planPriceCents(invoice.plan)`. `dsp_1043` claiming $400 against Scale $249 is valid input; stored credit is 24900 cents.

Workers are isolated. They cannot see sibling chats. The shared contract in this file MUST be copied into every worker prompt.

## Goals / Non-Goals

**Goals:**

- Enable Accept credit and Decline so status and reviewer note persist.
- Cap accepted credit at the catalog plan price. Never invent a number.
- Split implementation into three file-disjoint workers for Cursor Desktop `/multitask`.
- Keep the same artifacts usable as Cloud Agent / Agent SDK prompts.

**Non-Goals:**

- Migrating `lib/disputes/suggested-credit-api.ts` from v1 to v2.
- Editing `tests/suggested-credit-api.test.ts`, the seed, or catalog prices.
- Implementing in the parent agent instead of dispatching.
- A fourth parallel worker to write tests.
- Using `api-instrumenter` as a dispute-resolution worker.
- Changing how suggested credit is *displayed* on the page (v1 may still show $400).

## Decisions

1. **One OpenSpec capability per worker.** `specs/dispute-resolution-helper|api|ui/spec.md` is the entire implementer prompt besides this contract. Do not start a sibling after another sibling "so it has context."

2. **Persist only in the helper.** The route imports `resolveDispute` and MUST NOT contain `prisma.`. The UI POSTs JSON; it does not import the helper.

3. **`action` is lowercase.** `accept` | `decline` in the body. Status stored is `ACCEPTED` | `DECLINED`. Body `{ action: "ACCEPTED" }` stays 400 `{ error: "action must be accept or decline" }`.

4. **Apply order is helper → API → UI.** Runtime 501 from UI or API until the helper lands is expected. A git conflict means a worker edited a sibling's file — revert that hunk.

5. **ATDD after apply, not during `/multitask`.** Each worker verifies only its row (function behavior / curl / source). Coordinator adds `tests/resolve-dispute.e2e.test.ts` with `dsp_tdd_*` fixtures, restores `dsp_1043`, and keeps that file out of default `npm test`.

6. **Desktop vs SDK use the same files.** Desktop: `/multitask @resolve-dispute.md` (shim) or `/opsx-apply resolve-dispute` for a single agent. SDK: `Agent.create` with `cloud.repos` pointing at this repo; `send` names `openspec/changes/resolve-dispute` and the three delta specs. Orchestrate planner publishes three worker tasks from those specs and names `dispute-verifier`. Specs are files in the clone plus prompt text — the Cloud Agents API has no OpenSpec field.

## Risks / Trade-offs

- Parallel workers can ship a 501 UI until the helper is applied. That is acceptable.
- `dispute-verifier` still checks suggested-credit v2 on the page; this change must not flip the client. Reviewer and verifier run after apply; green is evidence, not merge permission.
- Archiving writes main specs under `openspec/specs/`. Do not archive from a drive-by.

## Cursor Desktop — spec first, then `/multitask`

1. Review `proposal.md`, this design, and the three delta specs. Do not write product code yet.
2. Paste `/multitask @resolve-dispute.md` (201 card unchanged). Parent reads `tasks.md` and launches **exactly three** Task workers in one turn.
3. Each worker prompt: owned files + this shared contract + the matching `specs/<capability>/spec.md` + verify steps + constraints (no prices, no seed, no suggested-credit client, no `tests/suggested-credit-api.test.ts`).
4. Apply helper → API → UI. Sequential e2e. `ledgerly-reviewer check my work`. `dispute-verifier` on port 43173.

## Agent SDK — same spec, cloud workers

See `openspec/sdk-kickoff.md`. Spawn with `mode: "plan"` first if the run should only read artifacts; then a follow-up run (or `/opsx-apply` in Desktop) implements. `autoCreatePR: true` is optional. Filter dashboard Source → SDK. `CURSOR_API_KEY` is a personal or team service-account key, not a Team Admin key.
