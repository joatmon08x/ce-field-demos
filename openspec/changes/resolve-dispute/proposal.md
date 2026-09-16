## Why

The dispute detail Resolution panel cannot accept or decline a credit. `resolveDispute` throws, the resolve route returns 501 for a valid body, and Accept / Decline are disabled. Operators cannot persist a reviewer note or a capped credit.

This change is the OpenSpec form of `.cursor/plans/resolve-dispute.md`. Specs are the contract. Agents implement against the delta specs — they do not invent catalog prices or "fix" the $400 claim on `dsp_1043`.

## What Changes

- Implement `resolveDispute` so accept/decline persist status, optional reviewer note, and a catalog-capped credit on accept.
- Keep `POST /api/disputes/[id]/resolve` as a thin wrapper around that helper (validation already exists).
- Enable Accept credit and Decline on the Resolution panel; POST `{ action, reviewerNote }`; refresh so status and note show after save.

## Capabilities

### New Capabilities

- `dispute-resolution-helper`: Persist accept/decline in `lib/disputes/resolve.ts` only, capping accepted credit at the invoice plan price.
- `dispute-resolution-api`: Keep the resolve route as the HTTP adapter; no Prisma persist in the route.
- `dispute-resolution-ui`: Enable the Resolution panel to POST accept/decline with a reviewer note.

### Modified Capabilities

<!-- none — no main specs exist yet for this stub -->

## Impact

- `lib/disputes/resolve.ts` — implement `resolveDispute`
- `app/api/disputes/[id]/resolve/route.ts` — remain import-and-call; optional error mapping
- `app/disputes/[id]/page.tsx` and optionally `components/disputes/resolution-panel.tsx`
- After apply (sequential): `tests/resolve-dispute.e2e.test.ts` kept out of default `npm test`
- Out of scope: `lib/disputes/suggested-credit-api.ts`, `tests/suggested-credit-api.test.ts`, `prisma/seed.ts`, `lib/plans.ts` prices, suggested-credit v1 UI amount on `dsp_1043`
