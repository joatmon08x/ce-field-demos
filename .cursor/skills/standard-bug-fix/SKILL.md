---
name: standard-bug-fix
description: Pull one ce-field-demos Linear issue, then fix only that Ledgerly bug. Use when the user runs /standard-bug-fix with a Linear identifier or a field-demo title such as the Overdue / Needs review filter bug.
---

# Standard bug fix

Work one Linear issue from the operator’s **ce-field-demos** project. Do not expand scope to catalog migration, dispute resolution, or unrelated UI.

## 1. Read the ticket

Call **Linear** MCP (authenticate if needed):

1. `list_projects` query `ce-field-demos` — use the project whose team is the operator’s private field-demos team, not Customer Education.
2. `list_issues` on that project, or `get_issue` when the user passed an identifier (for example `CE-16`).
3. Match `FIELD_DEMO_ISSUES` titles in `lib/runbooks/linear-field-demos.ts` when the user passed a title instead of an ID.

If Linear MCP is missing, tell the operator to add Linear from the marketplace and to run `stage-linear-201` if the project is empty.

## 2. Stay inside the ticket

- Reproduce on the URLs in the issue body.
- Edit only paths named in the issue unless a listed file clearly imports a one-line helper you must touch.
- Catalog stays Starter **$49**, Growth **$99**, Scale **$249**.
- Do not "correct" the $400 claim on `dsp_1043`.
- Do not edit `tests/suggested-credit-api.test.ts` to force green.
- Do not finish the dispute resolution stub unless the ticket names it.

## 3. Known 201 cards

- **Change customer email on invoice detail** — skip email validation.
- **Dispute dsp_1043 claims $400 against a $249 Scale invoice** — switch the suggested-credit client to v2 only.
- **Overdue / Needs review filter does not change the list** — fix filter selection so the active pill matches the table.

## 4. Finish

Run the tests that cover the files you changed. Leave the planted suggested-credit red test red unless this issue is the dsp_1043 client migration and the user asked to migrate.
