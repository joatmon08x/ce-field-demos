---
name: stage-linear-201
description: Stage a personal Linear project named ce-field-demos with the five Ledgerly 201 issues before the MCP section of the 201 track. Use when preparing a demo machine, replacing CompanyTicket, or the user asks to set up Linear for 201.
---

# Stage Linear for the 201 track

Do this **before** the 201 section “How does my agent get more information?” CompanyTicket (`/companyticket`, `mcp/companyticket`, `plugin/companyticket`) is retired. The agent reads tickets from Linear.

Catalog stays Starter **$49**, Growth **$99**, Scale **$249**. Operator Avery Quinn. No real customers.

Issue bodies live in `lib/runbooks/linear-field-demos.ts`. Do not invent a sixth card or a fourth price.

## Isolation (required)

Linear privacy is **team** privacy. A project on a public team (Customer Education, FE Demos, FlyLo, Disney DXT, …) is visible to that team.

The same steps are in `README.md`, `demo-howto.md`, and `AGENTS.md`. Repeat them if the operator has not done this yet:

1. Open Linear → **Settings → Teams → New team**.
2. Name it for this operator only (example: `ce-field-demos-private` or `{displayName}-field-demos`).
3. Turn on **Make team private**.
4. Members: **only the operator**. Do not add Customer Education or any other team.
5. Do not attach the project to a public team later — that publishes it.

Workspace admins on some plans can still see private-team names in admin settings. That is Linear, not this skill. Do not put the board on Customer Education to “share” it.

If the operator has no private team yet, **stop**. Point them at those docs. Linear MCP cannot create teams. Do not `save_project` onto Customer Education or any other public team.

## 1. Linear MCP

Authenticate the Linear plugin (`mcp_auth` if tools are gated). Confirm `get_user` with `"me"`:

- `isGuest` is false
- The **private** team from Isolation is in `teams`

If `teams` is only public teams, stop.

## 2. Reuse or create the project

Search `list_projects` with query `ce-field-demos`.

- Reuse a project **only** when its `teams` are exactly the operator’s private team and `lead` is the operator (`me`).
- If `ce-field-demos` already exists on a public team, do **not** reuse it. Create `ce-field-demos ({displayName})` on the private team instead.

Otherwise `save_project`:

- `name`: `ce-field-demos` (or the uniqued name above)
- `setTeams`: the private team name or ID
- `leadTeam`: that same team
- `lead`: `"me"`
- `state`: `Backlog` or `Planned` — not a company initiative
- `summary`: from `LINEAR_FIELD_DEMOS_PROJECT.summary`
- `description`: Fieldnote 201 board. Five issues. Personal. Not Customer Education.

Do not add initiatives, Slack channels, or extra teams.

## 3. Seed issues

`list_issues` on that project. Match existing issues by **exact title** from `FIELD_DEMO_ISSUES`.

For each of the five cards, if missing, `save_issue`:

- `team`: the private team
- `project`: the project name or ID
- `title`, `description`, `priority`, `state` from the catalog
- `assignee`: `"me"` (the operator). Never create Avery Quinn as a Linear user.

Do not create workspace-wide labels. Put type (Story / Bug / Task) in the description heading if useful.

Do not comment as a fake reporter. Avery Quinn copy is already in the description.

## 4. Confirm

Report:

- Private team name
- Project URL
- Five issue identifiers + titles + URLs
- That `teams` on the project is only the private team

The 201 pastes use **titles**, not identifiers, so you do not edit `lib/runbooks/beats/201.ts` after minting IDs.

## 201 beats this unblocks

1. Add Linear MCP (Customize → MCPs).
2. Fix the suggested-credit bug (`FIELD_DEMO_SUGGESTED_CREDIT_TITLE`).
3. Linear from the marketplace if the plugin is not already connected.
4. `/standard-bug-fix` on `FIELD_DEMO_FILTER_TITLE`.

## Never

- Never stage onto Customer Education, FlyLo, Disney DXT, FE Demos, or any other shared team.
- Never complete dispute resolution or migrate suggested-credit as part of staging.
- Never edit `tests/suggested-credit-api.test.ts` or the seed.
- Never reintroduce CompanyTicket routes, MCP, or `plugin/companyticket`.
