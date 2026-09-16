---
name: plan-to-openspec
description: Turns a mocked ce-field-demos Linear issue or a scoped request into an OpenSpec change after /opsx-explore. Use when the user runs /plan-to-openspec, /opsx-explore, or wants spec-first artifacts from the 201 Fieldnote issues in lib/runbooks/linear-field-demos.ts. Do not use Cursor Plan mode.
disable-model-invocation: true
---

# Explore, then OpenSpec

Planning artifacts only. Do not edit product code. Do not `/opsx-apply`. Stop after `openspec validate <name> --strict` passes.

Do not use Cursor Plan mode or `/plan`. Start with `/opsx-explore` (follow `.cursor/skills/openspec-explore/SKILL.md`). Then propose.

## Rough loop

Specs live in an openspec/ folder (what the system should do).
A change gets its own folder: proposal, design, tasks, delta specs.
In the AI assistant you run slash commands like /opsx:explore → /opsx:propose → /opsx:apply → /opsx:archive.
When done, the change archives and specs become the new source of truth.

Cursor Desktop spells those commands with hyphens: `/opsx-explore`, `/opsx-propose`, `/opsx-apply`, `/opsx-archive`.

## Input

Pick **one** source. Do not invent a fourth Fieldnote issue or a fourth catalog price.

1. A scoped request the user already explored with `/opsx-explore`.
2. A 201 issue title or slug. **Pretend Linear**: read `FIELD_DEMO_ISSUES` in `lib/runbooks/linear-field-demos.ts`. Do not call Linear MCP. Do not run `stage-linear-201`. Do not add a ticket board, ticket API, or ticket MCP.
3. If the user says “201”, “Linear”, or “field demos” and names no issue, explore then propose all three catalog issues **sequentially** in array order (suggested-credit, then filter, then email). Never in parallel. Filter must be second.

Exact titles:

1. `Dispute dsp_1043 claims $400 against a $249 Scale invoice`
2. `Overdue / Needs review filter does not change the list`
3. `Change customer email on invoice detail`

Worked mappings: [examples.md](examples.md).

## Steps

1. Confirm `openspec/` exists (`openspec context --json`). If `no_openspec_root`, stop and tell the user to `openspec init`. Do not init automatically.
2. If explore has not run, run `/opsx-explore` on the request first. Do not skip to files.
3. Read `openspec/config.yaml` `context` and this repo’s catalog: Starter **$49**, Growth **$99**, Scale **$249**. Operator Avery Quinn. No real companies.
4. Derive a kebab-case change id from the issue slug or explored topic. Skip if `openspec/changes/<id>/` already exists unless the user asked to refresh it.
5. Follow `/opsx-propose` (or `openspec new change "<id>"` plus artifacts):
   - `proposal.md` — why, what, non-goals, capabilities
   - `specs/<capability>/spec.md` — ADDED/MODIFIED requirements with Given/When/Then
   - `design.md` — how, ownership, out of scope
   - `tasks.md` — checklist; one capability per isolated worker when work splits files
6. Copy acceptance from the issue `description` in `linear-field-demos.ts`. Paths in `ledgerlyPaths` become Impact. URLs in `ledgerlyUrls` become verify scenarios.
7. `openspec validate <id> --strict` and `openspec status --change <id>`. Report the change path. Do not implement.

## Constraints

- `dsp_1043` may claim $400 against Scale **$249**. Do not “correct” the claim or the seed. Stored credit on accept is **$249**.
- Do not edit `tests/suggested-credit-api.test.ts` to force green. Preserve v1 and v2 suggested-credit routes.
- Suggested-credit change: client to v2 only. Filter change: only filter selection. Email change: no email-format validation.
- Do not complete `lib/disputes/resolve.ts` unless the user asked to apply that change after propose.
- Do not archive. Specs become source of truth only after a later `/opsx-archive`.
- Parent `/multitask` prompts are the delta spec files plus `design.md`. Sequential tests are not a fourth parallel worker.
