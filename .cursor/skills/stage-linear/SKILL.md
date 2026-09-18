---
name: stage-linear
description: Create or reconcile the private ce-field-demos Linear board with its Fieldnote issues.
---

# Stage Linear

The agent reads issues from Linear. Run this before a beat that needs the Fieldnote board.

Catalog stays Starter **$49**, Growth **$99**, Scale **$249**. Operator Avery Quinn. No real customers.

Issue bodies live in `lib/runbooks/linear-field-demos.ts`. The board has exactly three issues. Do not invent another issue or a fourth price.

## Isolation (required)

Linear privacy is **team** privacy. A project on a public or shared team is visible to that team.

The same steps are in `README.md`, `demo-howto.md`, and `AGENTS.md`. Repeat them if the operator has not done this yet:

1. Open Linear → **Settings → Teams → New team**.
2. Name it for this operator only (example: `{displayName}-field-demos`).
3. Turn on **Make team private**. Team key can be **LY**. Settings URL looks like `https://linear.app/<workspace>/settings/teams/LY`.
4. Members: **only the operator**. Do not add any other team.
5. Do not attach the project to a public team later — that publishes it.

Workspace admins on some plans can still see private-team names in admin settings. That is Linear, not this skill. Do not put the board on a shared team to “share” it.

If the operator has no private team yet, **stop**. Point them at those docs. Linear MCP cannot create teams. Do not `save_project` onto a public or shared team.

## 1. Linear MCP

Authenticate the Linear plugin (`mcp_auth` if tools are gated). Confirm `get_user` with `"me"`:

- `isGuest` is false

If the user is a guest, stop.

## 1a. Confirm the target private team (required)

Never **assume** which team to write to — not even when only one private team exists, and not from a name that looks like `{displayName}-field-demos`. An operator may name the team anything; confirm it, do not guess.

1. Build the candidate list: every **private** team on `me` (from `get_user` → `teams`, or `list_teams`). Public and shared teams are never candidates. Free-form names are fine — any team name is valid, not just `{displayName}-field-demos`.
2. Present each candidate with: team name, team key (e.g. `LY`), privacy, and the settings URL `https://linear.app/<workspace>/settings/teams/<KEY>`.
3. **Interactive run:** stop and have the operator confirm exactly one team before any write.
   **Non-interactive run (cloud/background):** require an explicit team name or ID in the request. If none was given, or more than one candidate matches it, stop and print the candidates — do not guess.
4. If there are no private teams, stop and point the operator at the Isolation steps. Linear MCP cannot create teams.
5. Pin the confirmed team for the rest of the run. Every `save_project` and `save_issue` uses only that confirmed team ID or name.

## 2. Reconcile the project

Search `list_projects` with query `ce-field-demos`, scoped to the confirmed team.

- Reuse a project **only** when its `teams` are exactly the confirmed private team and `lead` is the operator (`me`).
- If `ce-field-demos` already exists on a public or a different team, do **not** reuse it. Create `ce-field-demos ({displayName})` on the confirmed private team instead.

Create it with `save_project` only when it is missing. Otherwise update the existing private project in place:

- `name`: `ce-field-demos` (or the uniqued name above)
- `setTeams`: the confirmed private team name or ID
- `leadTeam`: that same team
- `lead`: `"me"`
- `state`: `Backlog` — not a company initiative
- `summary`: from `LINEAR_FIELD_DEMOS_PROJECT.summary`
- `description`: Fieldnote demo board. Three scoped issues. Personal. Private team only.

A prior `reset-demo-state` may leave this project `Canceled` with its issues `Canceled` and still attached (they are not unlinked on reset). Reactivate it: setting `state`: `Backlog` here reopens the board, and §3 reopens the issues by title.

Do not add initiatives, Slack channels, or extra teams.

## 3. Seed issues

`list_issues` on that project. Match existing issues by **exact title** from `FIELD_DEMO_ISSUES`.

Create missing issues **sequentially** in the `FIELD_DEMO_ISSUES` array order. Never create them in parallel:

1. `Dispute dsp_1043 claims $400 against a $249 Scale invoice`
2. `Overdue / Needs review filter does not change the list`
3. `Change customer email on invoice detail`

The filter issue must always be the second issue created. For each missing issue, `save_issue`:

- `team`: the confirmed private team
- `project`: the project name or ID
- `title`, `description`, `priority`, `state` from the catalog
- `assignee`: `"me"` (the operator). Never create Avery Quinn as a Linear user.

If a matched issue already exists but is `Canceled` (left by a prior `reset-demo-state`), reuse it — `save_issue` with its `id` and set `state` back to its catalog value (`Todo` / `In Progress`). Do not create a duplicate.

Do not create workspace-wide labels. Put type (Story / Bug) in the description heading if useful.

Do not comment as a fake reporter. Avery Quinn copy is already in the description.

After seeding, list any issue on the project whose exact title is not in `FIELD_DEMO_ISSUES`. **Confirm with the operator before canceling any of them** — the confirmed team may hold unrelated work. On confirmation, cancel each extra (`save_issue` with `state`: `Canceled`). Never cancel extras silently.

## 4. Confirm

Report:

- The confirmed team: name, key, and settings URL
- That every write used only the confirmed team
- Project URL
- Three issue identifiers + titles + URLs
- That `teams` on the project is only the confirmed private team
- That `list_issues` on the project returns exactly the three catalog titles
- That the filter issue is second in creation order

Runbook pastes use **titles**, not identifiers, so you do not edit runbook beats after minting IDs.

## What this unblocks

1. Add Linear MCP (Customize → MCPs).
2. Fix the suggested-credit bug (`FIELD_DEMO_SUGGESTED_CREDIT_TITLE`).
3. Linear from the marketplace if the plugin is not already connected.
4. `/standard-bug-fix` on `FIELD_DEMO_FILTER_TITLE`.

## Never

- Never stage onto a public or shared Linear team.
- Never complete dispute resolution or migrate suggested-credit as part of staging.
- Never edit `tests/suggested-credit-api.test.ts` or the seed.
- Never add local ticket-board routes, MCP servers, or marketplace copies.
