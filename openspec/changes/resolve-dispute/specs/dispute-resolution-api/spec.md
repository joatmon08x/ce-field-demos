## Purpose

Keep `POST /api/disputes/[id]/resolve` as an HTTP adapter that validates `action` and calls `resolveDispute` without inlining Prisma persist.

## ADDED Requirements

### Requirement: Route validates action then delegates
The resolve route MUST keep `import { resolveDispute } from "@/lib/disputes/resolve"`. It SHALL call `resolveDispute` with `{ disputeId: id, action, reviewerNote }`. It MUST NOT contain `prisma.` persist. Success remains `{ ok: true }` with status 200 after the helper succeeds. `action` missing or not `accept` | `decline` remains 400 `{ error: "action must be accept or decline" }`.

#### Scenario: Invalid action is 400
- **GIVEN** `POST /api/disputes/dsp_1043/resolve`
- **WHEN** the body is `{ "action": "ACCEPTED" }`
- **THEN** the response status is 400
- **AND** the JSON body is `{ "error": "action must be accept or decline" }`

#### Scenario: Valid body calls the helper
- **GIVEN** the route file `app/api/disputes/[id]/resolve/route.ts`
- **WHEN** a valid body `{ "action": "accept", "reviewerNote": "ok" }` is posted
- **THEN** the handler calls `resolveDispute` with that dispute id, `action: "accept"`, and the reviewer note
- **AND** the file has no `prisma.` identifier

#### Scenario: Helper not implemented is 501
- **GIVEN** `resolveDispute` still throws `resolveDispute is not implemented`
- **WHEN** a valid accept body is posted
- **THEN** the response status is 501
- **AND** the body is not treated as success

#### Scenario: Helper success is 200
- **GIVEN** the helper is implemented
- **WHEN** `POST /api/disputes/dsp_1043/resolve` with `{ "action": "accept", "reviewerNote": "capped" }`
- **THEN** the response is 200 `{ "ok": true }`

### Requirement: API ownership
This capability owns `app/api/disputes/[id]/resolve/route.ts` only. It MUST NOT implement Prisma persist, edit the Resolution panel, or write tests.

#### Scenario: Worker stays in route file
- **WHEN** the API worker finishes
- **THEN** the only product file it changed is `app/api/disputes/[id]/resolve/route.ts`
