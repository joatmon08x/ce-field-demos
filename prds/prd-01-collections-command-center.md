# PRD: Collections Command Center

**Status:** Draft
**Owner:** [Product Manager name]
**Last updated:** September 28, 2026
**Tier availability:** Starter, Growth, Scale (amount-bearing views only)

---

## 1. Summary

Collections Command Center gives collections reps (e.g., "Avery") a single workspace to work an overdue book: open a customer, see what's owed, log a note, send a reminder, and record a payment — without leaving the Customers area or reconciling data across tools. A collections KPI on the main dashboard gives managers a real-time view of how the book is being worked.

## 2. Problem

Today, collections activity is scattered:

- Overdue balances live in the invoicing/AR module.
- Notes about promises-to-pay or disputes live in email, spreadsheets, or a separate CRM.
- Reminders sent to customers aren't tied back to the invoice or account timeline.
- Payments taken over the phone or manually recorded require a separate flow, and reps can't always tell whether an invoice is now fully settled.

Reps lose time context-switching, notes get lost, and managers have no aggregate view of collections health.

## 3. Goals

- Let a rep go from "open account" to "logged note, reminder sent, payment recorded" in one continuous flow.
- Make every collections touch (note, nudge, payment) part of the account's permanent activity history.
- Surface a collections KPI on the dashboard so managers can track overdue exposure and rep activity at a glance.
- Gate dollar-amount displays to paid tiers (Starter, Growth, Scale) consistent with existing plan entitlements.



## 4. Non-goals

- Automated dunning sequences / multi-step cadences (future phase).
- Payment plan / installment scheduling.
- Collections agency hand-off or legal escalation workflows.
- SMS/voice reminder channels (Nudge is in-app/email only for v1).
- Custom KPI configuration (v1 ships one fixed collections KPI card).



## 5. Primary user & scenario

**Persona:** Avery, Collections Specialist.

**Scenario (happy path):**

1. Avery opens **Customers**.
2. Avery selects an account and drills into its **overdue book** (list of past-due invoices for that account, oldest first, with days-past-due and outstanding balance).
3. Avery reviews context and adds a **collection note** (free text, timestamped, attributed to Avery) to the account.
4. Avery sends a **Nudge** — a reminder to the customer — which is automatically **logged as an activity** on the account timeline.
5. The customer pays over the phone. Avery records a **full catalog payment** against the invoice.
6. The invoice status transitions to **PAID** automatically once the recorded payment equals the outstanding balance.
7. Back on the **Dashboard**, the collections KPI reflects the updated overdue total and today's activity count.



## 6. Scope & functional requirements



### 6.1 Customers → Account → Overdue Book

- FR-1: From the Customers list, selecting an account opens the Account Detail view.
- FR-2: Account Detail includes an **Overdue Book** tab/section listing all invoices with status `OVERDUE`, sorted by days-past-due descending by default.
- FR-3: Each row shows: invoice #, invoice date, due date, days past due, outstanding balance (amount-gated, see §7), and last activity date.
- FR-4: Selecting an invoice row expands/opens invoice detail with full line items and payment history.



### 6.2 Collection Notes

- FR-5: From the Overdue Book or Account Detail, a rep can add a **Collection Note**: free-text field, saved with author, timestamp, and (optionally) a linked invoice.
- FR-6: Saved notes appear in reverse-chronological order in an Account Activity/Notes panel.
- FR-7: Notes are editable by their author within [X minutes] of creation; not deletable (audit trail).



### 6.3 Nudge (reminder)

- FR-8: A rep can trigger a **Nudge** from the account or a specific invoice — a reminder sent to the customer's on-file contact (email in v1).
- FR-9: Sending a Nudge automatically creates an **Activity** record: type `NUDGE_SENT`, timestamp, sender, channel, and linked invoice (if applicable).
- FR-10: Nudge content is a system-default reminder template in v1 (no custom composition); template references invoice #, balance due, and due date.
- FR-11: Nudge send failures (bad email, bounce) surface as a failed-activity state, not a silent failure.



### 6.4 Payments

- FR-12: A rep can record a **payment** against an invoice from the invoice detail view.
- FR-13: v1 supports a **full catalog payment**: the entire outstanding balance of the invoice, using existing supported payment methods ("catalog" of payment types already defined elsewhere in the product — e.g., check, ACH, card-on-file, cash).
- FR-14: Partial payments are out of scope for this PRD (see §4/§10 open question) unless already supported elsewhere; if entered, system must not incorrectly mark the invoice `PAID`.
- FR-15: Recording a full payment that equals the outstanding balance automatically transitions the invoice status to `PAID` and removes it from the Overdue Book.
- FR-16: Recording a payment creates an Activity record: type `PAYMENT_RECORDED`, amount (gated), method, timestamp, and recorder.
- FR-17: Payment recording requires confirmation (e.g., "Record $X payment against Invoice #Y?") before committing, to prevent misfires.



### 6.5 Account Activity Timeline

- FR-18: All actions in §6.2–6.4 (notes, nudges, payments) write to a single, chronological **Activity** feed on the account, so a rep can reconstruct the full collections history at a glance.



### 6.6 Dashboard Collections KPI

- FR-19: The main Dashboard displays a **Collections KPI** card showing, at minimum: total overdue balance across accounts (amount-gated), count of overdue invoices, and count of collections activities logged (e.g., today / this week).
- FR-20: KPI updates in near-real-time (or on next dashboard load) after a note, nudge, or payment is recorded.
- FR-21: KPI is visible to all users with dashboard access; the **amount figures within it** are gated per §7.



## 7. Plan gating (Starter / Growth / Scale)

- FR-22: All **dollar-amount displays** introduced by this feature — outstanding balance in the Overdue Book, invoice balance, payment amount, and the KPI's overdue total — are visible only on **Starter, Growth, and Scale** plans.
- FR-23: On plans outside this set (e.g., a free/trial tier, or any tier not listed), the feature's non-monetary functionality (overdue list, notes, Nudge, activity log, invoice status) remains available, but amount fields are masked/hidden (e.g., replaced with a lock icon or "Upgrade to view amounts" affordance) rather than the whole feature being hidden.
- FR-24: Recording a payment still requires an amount internally (to correctly mark `PAID`) even on a gated plan — the *input* isn't blocked, only the *display* of aggregate/other amounts is gated. Confirm with design whether the payment-entry screen itself should also mask amounts or is exempt as a data-entry surface (see open questions).



## 8. Data model (indicative)


| Entity         | Key fields                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Account        | id, name, status, plan_tier                                                                                               |
| Invoice        | id, account_id, invoice_date, due_date, status (`OPEN`/`OVERDUE`/`PAID`), outstanding_balance, days_past_due              |
| CollectionNote | id, account_id, invoice_id (nullable), author_id, body, created_at                                                        |
| Activity       | id, account_id, invoice_id (nullable), type (`NOTE_ADDED`/`NUDGE_SENT`/`PAYMENT_RECORDED`), actor_id, payload, created_at |
| Payment        | id, invoice_id, amount, method, recorded_by, recorded_at                                                                  |




## 9. Acceptance criteria

- [ ] Given an account with ≥1 overdue invoice, Avery can navigate Customers → Account → Overdue Book and see it listed with correct days-past-due.
- [ ] Given an open invoice row, Avery can save a collection note and it appears immediately in the account's activity feed.
- [ ] Given an account/invoice, sending a Nudge creates a `NUDGE_SENT` activity record with correct timestamp and channel.
- [ ] Given an overdue invoice, recording a full payment equal to the outstanding balance sets invoice status to `PAID` and removes it from the Overdue Book.
- [ ] Given a `PAID` transition, a `PAYMENT_RECORDED` activity is created.
- [ ] Dashboard Collections KPI reflects updated overdue total and activity counts after each of the above actions, without requiring a full page reload beyond next refresh.
- [ ] On a plan outside Starter/Growth/Scale, all amount fields introduced by this feature are hidden/masked while the rest of the workflow remains functional.
- [ ] On Starter, Growth, and Scale, all amount fields display normally.



## 10. Open questions

1. Does "full catalog payment" imply payment method must be chosen from an existing, already-defined method list — confirm which methods are in that catalog today.
2. Should partial payments be explicitly blocked in v1, or just not built (with backend validation preventing an incorrect `PAID` transition if entered via API)?
3. Is the payment-entry screen itself exempt from amount-gating (since the rep must see the balance to take a correct payment), or does it also mask?
4. What is the exact plan/tier name for anything below Starter (e.g., Free/Trial) — confirm gating boundary and whether Enterprise (if it exists) is included or has its own path.
5. Nudge channel: email only for v1 — confirm no SMS requirement from sales/CS.
6. Retention/audit requirements for collection notes (edit window, immutability).



## 11. Success metrics

- Reduction in average days-sales-outstanding (DSO) for accounts touched by Collections Command Center vs. control.
- % of overdue invoices with at least one logged activity within 7 days of becoming overdue.
- Time-to-payment after first Nudge sent.
- Rep adoption: % of collections reps using the note/nudge/payment flow weekly.



## 12. Rollout

- Phase 1: Ship to internal collections team (dogfood) on Growth/Scale test accounts.
- Phase 2: GA to all Starter/Growth/Scale customers.
- Not shipped to tiers outside Starter/Growth/Scale until gating (§7) is validated by QA.

