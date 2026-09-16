## Purpose

Persist accept and decline for a dispute in the domain helper, capping accepted credit at the invoice catalog plan price.

## ADDED Requirements

### Requirement: Helper persists accept with catalog cap
The system MUST implement `resolveDispute` in `lib/disputes/resolve.ts` only. On `action: "accept"` it SHALL load the dispute and invoice, persist status `ACCEPTED`, save optional `reviewerNote`, and set `suggestedCreditCents` using `suggestDisputeCredit({ disputedAmountCents, planPriceCents: planPriceCents(invoice.plan) })`. It MUST NOT persist a credit above the plan. Prisma persist lives in this file via `import { prisma } from "@/lib/prisma"`.

#### Scenario: Scale claim of $400 stores $249
- **GIVEN** a dispute that claims 40000 cents against a Scale invoice priced at 24900 cents
- **WHEN** `resolveDispute` is called with `{ action: "accept", reviewerNote: "approve cap" }`
- **THEN** the dispute status is `ACCEPTED`
- **AND** stored `suggestedCreditCents` is 24900
- **AND** `reviewerNote` is saved
- **AND** the function does not throw `resolveDispute is not implemented`

#### Scenario: Missing dispute throws
- **GIVEN** a `disputeId` that does not exist
- **WHEN** `resolveDispute` is called with `{ action: "accept" }`
- **THEN** the helper throws (the route may map that error; the helper MUST NOT return a fake success)

### Requirement: Helper persists decline without raising credit
On `action: "decline"` the helper SHALL persist status `DECLINED` and optional `reviewerNote`. It MUST NOT raise `suggestedCreditCents`.

#### Scenario: Decline leaves credit unchanged
- **GIVEN** a dispute whose stored suggested credit is already 24900 cents
- **WHEN** `resolveDispute` is called with `{ action: "decline" }`
- **THEN** status is `DECLINED`
- **AND** `suggestedCreditCents` is not increased

### Requirement: Helper ownership
This capability owns `lib/disputes/resolve.ts` only. It MUST NOT edit the resolve route, the dispute page, the seed, suggested-credit client or routes, `lib/plans.ts` prices, or any test file.

#### Scenario: Worker stays in helper file
- **WHEN** the helper worker finishes
- **THEN** the only product file it changed is `lib/disputes/resolve.ts`
