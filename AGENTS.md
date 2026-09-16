<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Ledgerly

Fictional billing ops SaaS. Fieldnote Workspace. Operator Avery Quinn. No auth. No real companies.

Catalog prices are frozen: Starter **$49**, Growth **$99**, Scale **$249**. Never invent a fourth price, live ARR, or a real customer name.

This is a **Cursor demo app** with two jumpable tracks: 101 and 201. Runbook beats live in `lib/runbooks/meta.ts` and as copy-paste blocks on `/runbooks/101` and `/runbooks/201`; the presenter run-of-show is `demo-howto.md`. Project subagents live in `.cursor/agents/`. Skills live in `.cursor/skills/`. Do not add talk-track or speaker-note skills. Do not reintroduce retired Advanced runbooks without a request.

## Cursor Cloud specific instructions

### Install

```bash
npm i
npx prisma generate
```

`.cursor/environment.json` runs that on setup.

### Seed

SQLite file is `prisma/dev.db` (gitignored). Schema URL is hardcoded in `prisma/schema.prisma` as `file:./dev.db`. No `.env` required.

```bash
npx prisma db seed
```

The seed script runs `prisma db push` first, then reloads deterministic Fieldnote data. Safe to re-run. Demo clock is **2026-08-23**.

### Dev server

```bash
npm run dev
```

Listens on **43173** (not 3000).

### Private Linear team (manual, before 201 MCP)

Linear MCP cannot create teams. The operator creates a private team in the Linear UI, then an agent runs `stage-linear-201`.

1. Open Linear → **Settings → Teams → New team**.
2. Name it for this operator only (example: `{displayName}-field-demos`).
3. Turn on **Make team private**. Team key can be **LY**. Settings URL looks like `https://linear.app/<workspace>/settings/teams/LY`.
4. Members: **only the operator**. Do not add any other team.
5. Run `stage-linear-201` to create or reconcile project `ce-field-demos` on that team with exactly three Fieldnote issues.

Do not `save_project` onto a public team. Do not add a local ticket board, ticket API, ticket MCP, or ticket marketplace plugin.

### Tests

```bash
npm test
```

One test fails on a clean tree: `tests/suggested-credit-api.test.ts` expects the client to use v2 while `lib/disputes/suggested-credit-api.ts` still selects deprecated v1. That migration is tracked on its own, so do not fix it as a drive-by. Preserve both routes and never change the test or seed to get green.

Passing tests include `tests/money.test.ts` and `tests/plans.test.ts`. Environment start seeds the database and runs only the passing tests so a red suite cannot mark the machine as failed to boot.

Shipped suite on a clean tree: **1 failed / 29 passed**. The `dsp_1043` page shows v1's $400 result; v2 and the stored credit are correctly capped at $249. Invoice and dispute status pills write `state=` while the pages read `status` — that click path is a separate planted UI seam, not a second red test. Do not volunteer it when explaining the app or the failing test; only when the user is on that click path.

### OpenSpec

Change `resolve-dispute` lives in `openspec/changes/resolve-dispute/`. Specs are the contract; do not implement that stub unless the user applies the change (`/opsx-apply`, `/multitask @resolve-dispute.md`, or an Agent SDK spawn from `openspec/sdk-kickoff.md`).

```bash
npx openspec validate resolve-dispute --strict
npx openspec status --change resolve-dispute
```

Cursor Desktop slash commands are `/opsx-propose`, `/opsx-apply`, `/opsx-archive` (hyphen form). Parent agents do not implement `resolve-dispute`; they dispatch one worker per delta spec. Do not archive unless asked. CLI: `@fission-ai/openspec` (devDependency) or `npx @fission-ai/openspec`.

### Multi-file stub (leave it unless asked)

Incomplete on purpose until change `resolve-dispute` is applied:

- `lib/disputes/resolve.ts`
- `app/api/disputes/[id]/resolve/route.ts`
- `app/disputes/[id]/page.tsx` (resolution panel)

### Product constraints

- Prices only from `lib/plans.ts`.
- Customer names only from `prisma/seed.ts` and `prisma/extra-accounts.ts`.
- Comments in code must not cite Slack, GitHub, or issue-tracker URLs.
- Do not rename Collections / Nudge / Pulse / Slatebook / Harborbill, and never reintroduce retired pre-remap names.
- Do not add Deno workflows or GitHub Actions starters. Do not add better-sqlite3.
- Do not add talk-track / speaker-note skills. Do not add a fourth catalog-solving agent. Runbook beats live in `lib/runbooks/meta.ts`.
- Do not rename the FilterPills query key from `state` to `status` unless asked.
- Do not add a Prisma/SQLite MCP or restore the `mcp/` directory. Query the seed with Prisma (`write-prisma-query`) or the HTTP API.

### Agents and skills

| Path | Role |
| --- | --- |
| `.cursor/agents/ledgerly-reviewer.md` | Verifier after code changes |
| `.cursor/agents/api-instrumenter.md` | `/multitask` worker — one API route |
| `.cursor/agents/dispute-verifier.md` | `/goal` and `/orchestrate` finish line |
| `.cursor/skills/choose-cursor-workflow/` | Walk the 101 or 201 track: modes, models, rules, skills, and finishing one task with an agent |
| `.cursor/skills/stage-linear-201/` | Before the 201 MCP section: reconcile three issues on the private `ce-field-demos` Linear project |
| `.cursor/skills/standard-bug-fix/` | `/standard-bug-fix` — pull one ce-field-demos Linear issue and fix only that bug |
| `.cursor/skills/dispatch-subagents/` | Parallel Task launches; `resolve-dispute` maps one worker per OpenSpec delta spec |
| `.cursor/skills/plan-to-openspec/` | `/plan-to-openspec` — translate a plan or mocked 201 Linear issue into an OpenSpec change |
| `.cursor/skills/openspec-propose/` | `/opsx-propose` — planning artifacts only |
| `.cursor/skills/openspec-apply-change/` | `/opsx-apply` — implement an OpenSpec change |
| `.cursor/skills/hand-to-cloud-agent/` | Cloud `/goal`, `/autopilot`, and `/orchestrate` |
| `.cursor/skills/write-prisma-query/` | Invoice, dispute, and customer lookups against SQLite — not an MCP |
| `.cursor/mcp.json` | Empty project MCP map. 101 uses Figma (user MCP). 201 uses Linear (user MCP or `plugins/standard-bug-fix`). |
| `plugins/standard-bug-fix/` | 201-track disk plugin: `/standard-bug-fix` skill, Linear writeback rule, Linear MCP. |
