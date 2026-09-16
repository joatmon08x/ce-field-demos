## 1. Helper worker (parallel — Task subagent)

Delta spec: `openspec/changes/resolve-dispute/specs/dispute-resolution-helper/spec.md`. Shared contract: `design.md`. Owns `lib/disputes/resolve.ts` only.

- [ ] 1.1 Implement `resolveDispute` so it no longer throws `resolveDispute is not implemented`
- [ ] 1.2 On accept, persist `ACCEPTED`, optional note, and `suggestedCreditCents` capped with `suggestDisputeCredit` + `planPriceCents` (Scale $400 claim stores 24900 cents)
- [ ] 1.3 On decline, persist `DECLINED` without raising credit; missing id throws
- [ ] 1.4 Verify only the helper file changed; do not write tests

## 2. API worker (parallel — Task subagent)

Delta spec: `openspec/changes/resolve-dispute/specs/dispute-resolution-api/spec.md`. Shared contract: `design.md`. Owns `app/api/disputes/[id]/resolve/route.ts` only.

- [ ] 2.1 Keep `import { resolveDispute } from "@/lib/disputes/resolve"` and call it with `{ disputeId: id, action, reviewerNote }`
- [ ] 2.2 Do not inline Prisma persist (`prisma.` MUST NOT appear in the route)
- [ ] 2.3 Leave 400 validation as-is; success stays `{ ok: true }`; map helper "not implemented" to 501
- [ ] 2.4 Verify with invalid `action` → 400; do not write tests

## 3. UI worker (parallel — Task subagent)

Delta spec: `openspec/changes/resolve-dispute/specs/dispute-resolution-ui/spec.md`. Shared contract: `design.md`. Owns `app/disputes/[id]/page.tsx` plus optional `components/disputes/resolution-panel.tsx`.

- [ ] 3.1 Enable Accept credit and Decline; bind reviewer note
- [ ] 3.2 POST `{ action, reviewerNote }` to `/api/disputes/{id}/resolve`; refresh status and note
- [ ] 3.3 Do not call `resolveDispute` from the client; do not invent a credit; do not migrate suggested-credit v1
- [ ] 3.4 Verify buttons enabled and body shape; 501 until helper apply is OK; do not write tests

## 4. After the three diffs (sequential — parent / coordinator only)

Not a fourth `/multitask` worker. Apply order: helper → API → UI.

- [ ] 4.1 Add `tests/resolve-dispute.e2e.test.ts` and keep it out of default `npm test`; use `dsp_tdd_*` fixtures; restore `dsp_1043` after mutating cases
- [ ] 4.2 Cover accept on a $400 Scale claim → 200 `{ ok: true }`, status `ACCEPTED`, stored credit 24900 cents, note saved; decline → `DECLINED` without raising credit; `{ action: "ACCEPTED" }` → 400
- [ ] 4.3 Confirm route still imports `resolveDispute` with no `prisma.` persist; `npm test` remains 1 failed / 29 passed
- [ ] 4.4 `ledgerly-reviewer` on the combined diff, then `dispute-verifier` against the app on port 43173
- [ ] 4.5 Human reviews and merges. Do not `/opsx-archive` unless asked
