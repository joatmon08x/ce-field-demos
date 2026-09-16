# 201 mocked Linear issues → OpenSpec

Source of truth for titles, bodies, paths, and URLs: `FIELD_DEMO_ISSUES` in `lib/runbooks/linear-field-demos.ts`. Treat each row as a Linear issue. Do not fetch Linear.

Catalog only: Starter $49, Growth $99, Scale $249.

## 1. suggested-credit-v1

- Change id: `suggested-credit-v2-client`
- Capability: `suggested-credit-client`
- Owns: `lib/disputes/suggested-credit-api.ts` only for the client switch
- Non-goals: seed, `$400` claim, deleting v1 or v2 routes, editing `tests/suggested-credit-api.test.ts`

Requirement sketch:

```markdown
### Requirement: Client selects suggested-credit v2
The dispute page client MUST call `/api/v2/disputes/{id}/suggested-credit`.

#### Scenario: dsp_1043 shows the Scale cap from v2
- **GIVEN** dispute dsp_1043 claims 40000 cents against a Scale invoice priced at 24900 cents
- **WHEN** the page loads suggested credit
- **THEN** the client requests v2
- **AND** v2 returns 24900 cents
- **AND** v1 still returns the raw 40000 cent claim
```

## 2. filter-pills (always second if translating the whole board)

- Change id: `filter-pills-status`
- Capability: `status-filter-pills`
- Owns: `components/filter-pills.tsx` plus the invoice and dispute list pages if they must read the same query key the pills write
- Non-goals: suggested-credit migration, resolve stub, new filter dimensions

Requirement sketch:

```markdown
### Requirement: Status pill filters the list
Selecting a status pill SHALL show only rows with that status and mark only that pill active. All SHALL show the full seeded book.

#### Scenario: Invoices Overdue
- **GIVEN** the invoices list
- **WHEN** the operator selects Overdue
- **THEN** only OVERDUE rows are listed
- **AND** only the Overdue pill is active

#### Scenario: Disputes Needs review
- **GIVEN** the disputes list
- **WHEN** the operator selects Needs review
- **THEN** only NEEDS_REVIEW rows are listed
- **AND** only the Needs review pill is active
```

## 3. email-on-invoice

- Change id: `invoice-detail-email`
- Capability: `invoice-customer-email`
- Owns: `app/invoices/[id]/page.tsx` (customer card)
- Non-goals: email-format validation, renaming customers, inventing `.example` addresses, catalog prices

Requirement sketch:

```markdown
### Requirement: Invoice detail can change customer email
The invoice detail customer card SHALL let Avery Quinn update the seeded contact email. It MUST NOT add email-format validation.

#### Scenario: Save a new .example address
- **GIVEN** an invoice on the Fieldnote book
- **WHEN** the operator submits a new contact email on the customer card
- **THEN** that email persists
- **AND** the customer name is unchanged
```

## After explore

`/opsx-explore` first. Then `/opsx-propose`. If the work splits disjoint files, one capability per `/multitask` worker (same shape as a helper / API / UI split). There is no shipped `resolve-dispute` OpenSpec change; start from scratch.
