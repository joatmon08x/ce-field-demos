# Finish dispute resolution (Accept / Decline)

## Goal

Enable **Accept credit** and **Decline** on the dispute detail Resolution panel so a reviewer note and status persist. Cap any accepted credit with the catalog plan price. Never invent a number.

Catalog prices only: Starter $49, Growth $99, Scale $249 (`lib/plans.ts`). Dispute `dsp_1043` may claim $400 against a $249 Scale invoice — that claim is valid input; the stored credit on accept must cap at the plan price.

## Context

- Helper stub: `lib/disputes/resolve.ts` throws `resolveDispute is not implemented`. Imports `planPriceCents` and `suggestDisputeCredit` but does not call them.
- Route: `POST /api/disputes/[id]/resolve` already validates `action` (`accept` | `decline`) and optional `reviewerNote`. It returns 400 for a bad action and 501 until the helper succeeds.
- UI: Accept / Decline are disabled on `app/disputes/[id]/page.tsx`. The reviewer note textarea is unbound. Copy already points at the POST route and the catalog cap.
- Suggested-credit client (v1 vs v2) is a separate 101 seam — leave it alone. Do not edit `tests/suggested-credit-api.test.ts` or migrate `lib/disputes/suggested-credit-api.ts`.

## Approach

1. Implement `resolveDispute` in `lib/disputes/resolve.ts`:
   - Load the dispute and its invoice.
   - On accept, cap credit with `suggestDisputeCredit` + `planPriceCents` (never invent a number; do not persist a credit above the plan).
   - Persist `ACCEPTED` or `DECLINED` and the optional reviewer note.
2. Confirm the resolve API returns `{ ok: true }` once the helper works (the try/catch already maps helper success to 200; leave 400 validation as-is). Only tighten 501 handling if a real error should no longer look like “not implemented.”
3. Enable the Resolution panel to POST `{ action, reviewerNote }` to `/api/disputes/[id]/resolve` and refresh so status and note show after save. Extract a small client child if the page stays a server component.

## Out of scope

- Suggested-credit API client / planted $400 vs $249 display bug (v1 returns the raw claim; v2 and stored credit cap at $249).
- Seed, catalog prices, customer email feature.
- Inventing a credit above the plan price.
- Completing anything beyond this stub unless asked.

## Files likely touched

- `lib/disputes/resolve.ts`
- `app/api/disputes/[id]/resolve/route.ts`
- `app/disputes/[id]/page.tsx` (+ small client child if needed)
