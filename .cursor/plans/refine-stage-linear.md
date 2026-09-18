# Refine `stage-linear` team confirmation + `reset-demo-state` Linear teardown

Tracks GitHub issue #37 (`stage-linear feedback`, Raymond Camden): the operator made a
private team named `CE201-Ray`, ran `stage-linear`, and the skill discovered and wrote to
that team from `get_user` → `teams` **without ever confirming it**. The skill must not
assume which private team to use. This plan also makes `reset-demo-state` tear the Linear
board down cleanly, using the same team-confirm gate.

Decisions locked with the operator: **all option A, mirror everywhere.**

## Guardrails (unchanged)

- Catalog stays Starter $49 / Growth $99 / Scale $249. Operator Avery Quinn. No real customers.
- Exactly three issues from `FIELD_DEMO_ISSUES` in `lib/runbooks/linear-field-demos.ts`; filter issue is always created **second**.
- Linear MCP **cannot** create teams and has **no** hard-delete for issues or projects. "Clean"
  means cancel + unlink + cancel/archive the project — never trash, never delete the team.
- Never stage onto or reset a public/shared team. Never touch another team's issues.
- Do not migrate suggested-credit v1→v2, resolve disputes, edit the seed, or edit
  `tests/suggested-credit-api.test.ts` as part of this work.

## Decisions

| # | Topic | Choice |
| --- | --- | --- |
| 1 | Confirmation aggressiveness | **A** — always confirm the exact team (name, key, settings URL) before any write, even with a single private team match. |
| 2 | Candidate detection | **A** — every private team the operator is on is a candidate; free-form names like `CE201-Ray` are valid. No name convention required. |
| 3 | Non-interactive (cloud/background) runs | **A** — require an explicit team name/ID in the request; if missing or ambiguous, stop and print the candidates instead of guessing. |
| 4 | `ce-field-demos` already on the wrong team | **A** — never reuse; create `ce-field-demos ({displayName})` on the confirmed private team. |
| 5 | Destructive reconcile of non-catalog issues | **A** — list the extras and confirm before canceling/removing any. |
| 6 | Doc mirror | **Yes, everywhere** — `README.md`, `demo-howto.md`, `AGENTS.md`, `.cursor/rules/ledgerly.mdc`. |
| 7 | reset "clean" teardown | **A (amended)** — cancel every issue on the matched project (`state: Canceled`), then set the project `state` to Canceled. **Do not unlink issues** (`project: null`); leave them attached to the canceled project. Team retained. |
| 8 | Which project(s) reset touches | **A** — only projects on the confirmed private team named `ce-field-demos` / `ce-field-demos (*)` with `lead` = `me`. |
| 9 | When reset runs Linear | **A** — always offer Linear cleanup when the MCP is connected; skip only on auth failure or no confirmed team. |
| 10 | Symmetry | **A** — reset reuses the same confirm-team gate as `stage-linear`. |

## Shared team-confirm gate (used by both skills)

Insert after Linear auth, before any project/issue mutation. Same wording in both skills.

1. `get_user` `"me"` — `isGuest` must be false (else stop).
2. Build the **candidate list**: every **private** team on the user. Public/shared teams are never candidates.
3. Present each candidate: team name, team key (e.g. `LY`), privacy, and the settings URL
   pattern `https://linear.app/<workspace>/settings/teams/<KEY>`.
4. **Interactive:** stop and require the operator to confirm exactly one team.
   **Non-interactive:** require an explicit team name/ID in the request. If absent or more
   than one candidate matches, stop and print the candidates — do not guess.
5. Pin the confirmed team for the whole run. Every `save_project` / `save_issue` uses only
   that team ID/name.

Explicit never: do not infer the team from "the first/only private team" or from name
similarity. Confirmation is required even for a single match (decision 1).

## Plan A — `stage-linear` (`.cursor/skills/stage-linear/SKILL.md`)

- **A1. New "Confirm target team" step** between auth (§1) and reconcile (§2), implementing the
  shared gate above. Rewrite the current §1 language ("confirm the private team from Isolation
  is in `teams`") so it no longer implies auto-detection.
- **A2. Scope reconcile to the confirmed team.** `list_projects` query stays `ce-field-demos`
  but only reuse a project whose `teams` are exactly the confirmed team and `lead` is `me`.
  Wrong-team `ce-field-demos` → create `ce-field-demos ({displayName})` (decision 4, current
  behavior kept).
- **A3. Reconcile issues (decision 5).** Keep sequential create order (filter second). Before
  canceling/removing any issue whose title is not in `FIELD_DEMO_ISSUES`, **list the extras and
  confirm**. Replaces today's silent cancel.
- **A3b. Reactivate a torn-down board (interaction with Plan B).** Because reset leaves canceled
  issues linked to a canceled project (decision 7 amended), a matched project may come back
  `Canceled` with `Canceled` issues attached. When reusing it, set the project `state` back to
  `Backlog` and, for each catalog issue matched by exact title, set its `state` back to the
  catalog value (`Todo` / `In Progress`). This is what keeps repeat runs idempotent now that
  issues are no longer unlinked on reset.
- **A4. Confirm report** adds: confirmed team name + key + settings URL, and an explicit line
  "writes used only this team."
- **A5.** Reference issue #37 in the PR/commit: the skill asks which private team; it does not
  assume `{displayName}-field-demos`.

## Plan B — `reset-demo-state` (`.cursor/skills/reset-demo-state/SKILL.md`, §5 Linear)

- **B1.** Front §5 with the shared confirm-team gate (decision 10). Never mutate a public/shared
  team or a project whose `teams` ≠ confirmed team.
- **B2. Find demo project(s)** on the confirmed team: name `ce-field-demos` or
  `ce-field-demos (*)`, `lead` = `me` (decision 8). If several match, list and confirm which.
- **B3. Teardown order (decision 7 amended), idempotent:** for each matched project —
  `list_issues`, then per issue `save_issue { state: Canceled }`; finally
  `save_project { state: Canceled }`. **Do not** set `project: null` — leave issues attached to
  the canceled project. Canceling the project alone does not clear its issues from the operator's
  "My Issues" / backlog views, so the issue `state` is still set to Canceled; the redundant
  unlink is dropped. `stage-linear` reactivates the project and re-opens matched issues on the
  next run (see A3b). Do not delete the team. (Verify the exact Canceled status string on the
  operator's team during the dry run and record it in the skill.)
- **B4. Reporting** lists confirmed team, project name + URL, canceled issue identifiers/titles,
  the canceled project, and the note "issues remain as Canceled and stay linked to the canceled
  project; team retained for the next `stage-linear`, which reactivates the board."
- **B5. Header goal** updated from "no leftover active issues" to "no open catalog issues; demo
  project canceled; team unchanged."
- **B6. When to run (decision 9):** always offer Linear cleanup when the MCP is connected; skip
  only on auth failure or when no team is confirmed.

## Doc mirror (decision 6)

Add a short "the agent confirms which private team before staging" beat to `README.md`,
`demo-howto.md`, `AGENTS.md`, and `.cursor/rules/ledgerly.mdc`. Keep the existing manual
team-creation steps; make clear the team name is the operator's choice (e.g. `CE201-Ray`) and
the agent will confirm it. Optionally note on `/runbooks/201` that `stage-linear` now confirms
the team.

## Tests to keep green (`tests/runbooks.test.ts`)

`tests/runbooks.test.ts` already asserts cross-file consistency. After the edits:

- Keep `reset` containing `stage-linear`, `FIELD_DEMO_ISSUES`, and `Canceled`.
- Keep `Settings → Teams → New team`, `Make team private`, and `settings/teams/LY` present in
  `README.md`, `demo-howto.md`, `AGENTS.md` (and `Make team private` in the rule).
- Keep the shipped-suite count `1 failed / 32 passed` identical across README, demo-howto,
  AGENTS, reset skill, and `.cursor/plans/resolve-dispute.md` — this is doc-only, so the count
  does not change.
- Add assertions that the `stage-linear` and `reset-demo-state` skills contain the confirm-team
  language (e.g. "confirm", "settings/teams", "do not assume") once implemented.

No change to `lib/runbooks/linear-field-demos.ts` or its test — titles/prices are frozen.

## Implementation order

1. Land this plan.
2. Shared confirm-team gate + `stage-linear` edits (A1–A5).
3. `reset-demo-state` teardown (B1–B6).
4. Mirror docs (decision 6) and update/extend `tests/runbooks.test.ts`.
5. Comment on #37 with the behavior summary; close on merge.
6. Dry run on a private team named like `CE201-Ray`: create → `stage-linear` → `reset-demo-state`
   → `stage-linear` again, confirming idempotency and the Canceled project state.

## Never

- Never stage onto or reset a public/shared team; never delete the operator's private team.
- Never auto-pick a private team without confirmation.
- Never migrate suggested-credit, resolve disputes, or edit the seed / the planted red test.
- Never add local ticket-board routes, a ticket MCP, or marketplace copies.
