## Purpose

Enable Accept credit and Decline on the dispute detail Resolution panel so a reviewer can persist an action and optional note through the resolve API.

## ADDED Requirements

### Requirement: Panel posts accept or decline with a reviewer note
The Resolution panel SHALL enable Accept credit and Decline. It SHALL bind the reviewer note and `POST` `{ action: "accept" | "decline", reviewerNote }` to `/api/disputes/{id}/resolve`. After a successful save it SHALL refresh so the status badge and note are visible. It MUST NOT import or call `resolveDispute` from the client. It MUST NOT invent a credit amount in the UI.

#### Scenario: Buttons are enabled and POST the contract body
- **GIVEN** dispute detail `/disputes/dsp_1043`
- **WHEN** the operator submits Accept credit with a reviewer note
- **THEN** the request body includes `action` set to `accept` and `reviewerNote` set to that note
- **AND** neither button is disabled for the unfinished-stub reason

#### Scenario: Decline posts decline
- **GIVEN** dispute detail `/disputes/dsp_1043`
- **WHEN** the operator submits Decline with a reviewer note
- **THEN** the request body includes `action` set to `decline` and the reviewer note

#### Scenario: Status and note persist after helper and API apply
- **GIVEN** helper and API are applied
- **WHEN** the operator Accepts or Declines on `/disputes/dsp_1043` with a note and reloads
- **THEN** the status badge and reviewer note still show
- **AND** suggested-credit display MAY still be v1 $400 — this worker MUST NOT change the suggested-credit client

#### Scenario: 501 before helper apply is allowed
- **GIVEN** the helper still throws not implemented
- **WHEN** the panel posts a valid accept body
- **THEN** a 501 from the API is acceptable
- **AND** the panel MUST NOT fake a persisted accept

### Requirement: UI ownership
This capability owns `app/disputes/[id]/page.tsx` and, if the page stays a server component, a small client child such as `components/disputes/resolution-panel.tsx`. It MUST NOT edit helper Prisma, route internals, `SuggestedCredit` / v1 client, seed, or tests.

#### Scenario: Worker stays in panel files
- **WHEN** the UI worker finishes
- **THEN** product edits are only the dispute detail page and optional resolution-panel client child
