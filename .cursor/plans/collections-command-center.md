# Collections Command Center

Build the workspace in [prds/prd-01-collections-command-center.md](prds/prd-01-collections-command-center.md). Customer is the account. The operator is Avery Quinn (`DEMO_OPERATOR` in [lib/demo-session.ts](lib/demo-session.ts)). Age invoices with `DEMO_AS_OF` (23 Aug 2026). Catalog amounts stay Starter $49, Growth $99, Scale $249, formatted with `formatUsd`.

## Work

- [ ] Add CollectionNote, Activity, and Payment models plus domain helpers for notes, nudges, payments, and amount gating
- [ ] Add Customers list and account Overdue Book, with invoice detail payment history
- [ ] Save notes, send email Nudges, and record full payments that set PAID only when the amount matches
- [ ] Add the collections KPI, tests that restore any mutated seed rows, and bump the shipped suite citations
- [ ] Run npm test, walk the happy path in the browser, then ledgerly-reviewer

## Decisions taken from the open questions

- **Payment methods.** Nothing in the product lists check, ACH, card, or cash. v1’s method list is those four PRD examples: `check`, `ach`, `card_on_file`, `cash`.
- **Partial payments.** The form only offers the full outstanding balance. The API rejects any other amount with 400 and does not set `PAID`.
- **Payment screen.** The confirmation shows the amount. It is the data-entry exception in FR-24. Every other new dollar figure goes through the gate.
- **Tiers.** Starter, Growth, and Scale are the whole catalog. Do not add Free, Trial, or Enterprise. `amountsVisible(plan)` is true only for those three ids. Any other id masks amounts. Seeded accounts all see amounts; a unit test covers the mask.
- **Nudge.** Email only, to the customer’s on-file address. No SMS.
- **Note edits.** Author Avery Quinn may edit a note for 15 minutes after `createdAt`. Notes cannot be deleted.

## Data model

Add three models on [prisma/schema.prisma](prisma/schema.prisma). Outstanding balance is `invoice.totalCents` minus recorded payments. There is no balance column today.

- `CollectionNote`: id, customerId, invoiceId nullable, authorName, body, createdAt, updatedAt
- `Activity`: id, customerId, invoiceId nullable, type (`NOTE_ADDED` | `NUDGE_SENT` | `PAYMENT_RECORDED`), actorName, status (`recorded` | `sent` | `failed`), payload JSON, occurredOn, createdAt
- `Payment`: id, invoiceId, amountCents, method, recordedBy, recordedAt

`occurredOn` is `DEMO_AS_OF`, so “today” on the frozen clock includes work done in this session. `createdAt` is insertion time, used for reverse-chronological order and the 15-minute edit window.

In [prisma/seed.ts](prisma/seed.ts), `deleteMany` payments, activities, and notes before invoices and customers. Do not add sample notes, payments, or a new plan. A reseed clears the new rows and restores `OVERDUE` / `PAID` from the existing invoice list.

## Customers and overdue book

There is no customers route. Collections at [app/collections/page.tsx](app/collections/page.tsx) is a cross-account overdue list; leave it.

- Add **Customers** to the nav in [components/app-chrome.tsx](components/app-chrome.tsx).
- `/customers` lists seeded accounts. Each row shows name, plan, overdue invoice count, and overdue balance (amount-gated).
- `/customers/[id]` is Account Detail. The Overdue Book lists that account’s `OVERDUE` invoices, days-past-due descending (oldest first). Columns: invoice number, invoice date, due date, days past due, outstanding balance (gated), last activity date. Empty last activity is an em dash.
- A row links to the existing invoice page, which already shows line items. Add payment history there.

Days past due stay `daysBetween(DEMO_AS_OF, dueOn)` for `OVERDUE` invoices, matching the invoice page.

## Notes, Nudge, payments, activity

Account Detail holds the note composer, the Nudge control, and one activity feed (newest `createdAt` first).

- **Note.** `POST /api/customers/[id]/notes` with `{ body, invoiceId? }`. Blank body is 400. Persist the note and a `NOTE_ADDED` activity. `PATCH /api/notes/[id]` updates body only when the author is Avery Quinn and `createdAt` is within 15 minutes; otherwise 403. No delete route.
- **Nudge.** `POST /api/invoices/[id]/nudge`. Template is fixed: invoice number, outstanding balance, due date. No custom body. Valid on-file email writes `NUDGE_SENT` with status `sent`. Missing or non-email address writes the same type with status `failed` and the UI shows that failure. Account-level Nudge uses the most-past-due overdue invoice; if the account has none, the control is disabled.
- **Payment.** `POST /api/invoices/[id]/payments` with `{ method }`. Server computes the outstanding balance and records that full amount. Method must be one of the four. Outstanding of 0, or a body that includes a different `amountCents`, returns 400 and leaves status unchanged. Success writes `Payment`, sets invoice `status` to `PAID` and `paidOn` to `DEMO_AS_OF`, writes `PAYMENT_RECORDED`, and the invoice drops out of the Overdue Book.
- Invoice detail: payment history plus **Record payment**. The button opens a confirm step: method, then “Record {amount} payment against {invoice number}?” Commit only after confirm.

The activity feed renders notes, nudges (including failed), and payments for that account. Amounts inside the feed are gated. The payment confirm is not.

## Amount gate and KPI

`amountsVisible` lives next to the plan catalog and returns true only for `STARTER`, `GROWTH`, and `SCALE`. Masked figures show “Upgrade to view amounts” instead of `formatUsd`. Non-amount columns, notes, Nudge, status, and the activity log still render.

Dashboard ([app/page.tsx](app/page.tsx)): add one collections card. Do not restyle the existing four KPI cards or add a hex color. Use [components/kpi-card.tsx](components/kpi-card.tsx) tokens (`bg-indigo-soft`, `text-indigo`, and the existing danger tone for overdue). The card shows:

- overdue balance across accounts (gated)
- overdue invoice count
- activities whose `occurredOn` is the demo day
- activities in the 7 days ending `DEMO_AS_OF`

Compute the aggregates in [lib/dashboard.ts](lib/dashboard.ts) and expose them from `getDashboard()` in [lib/data.ts](lib/data.ts). The card updates on the next dashboard load.

## Tests and suite count

Pure tests, no new red file:

- amount gate masks a non-catalog plan id and shows Starter, Growth, and Scale
- partial or mismatched amount does not set `PAID`; a full outstanding amount does
- overdue sort is days-past-due descending
- note edit is allowed inside 15 minutes and rejected after, and delete is not offered
- nudge failure is a failed activity, not a thrown-away request
- dashboard helper: overdue total uses catalog cents only; activity counts use `DEMO_AS_OF`

Route tests that write must put the invoice and new rows back before the test exits. The shared SQLite seed is the database other tests read.

A new passing test moves **1 failed / 33 passed**. In the same change, set every citation to the new passed count, number only:

- [README.md](README.md), [demo-howto.md](demo-howto.md), [AGENTS.md](AGENTS.md)
- [.cursor/rules/ledgerly.mdc](.cursor/rules/ledgerly.mdc)
- [.cursor/skills/reset-demo-state/SKILL.md](.cursor/skills/reset-demo-state/SKILL.md)
- [.cursor/plans/resolve-dispute.md](.cursor/plans/resolve-dispute.md)
- the expected-count check in [scripts/demo-reset.ts](scripts/demo-reset.ts)

The sole failure stays `tests/suggested-credit-api.test.ts`.

## Verify

- `npm test` shows one failure, the suggested-credit client test, and the new cases pass.
- In the browser: Customers → an account with an overdue invoice → note appears on the feed → Nudge shows `sent` → confirm a full payment → invoice is `PAID` and gone from the Overdue Book → dashboard collections card matches the new overdue total and activity count. Reload the account and confirm the note is still there. Try a blank note and confirm it does not save.
- Then run `ledgerly-reviewer` on the diff.

## Trade-off

The four payment methods are not an existing catalog; they are the PRD’s examples, written down because the product has no method list. The 15-minute edit window is a stand-in for the PRD’s “[X minutes].” Customers and Collections will both show overdue invoices until a later pass picks one entry point.
