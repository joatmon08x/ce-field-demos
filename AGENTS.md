<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Ledgerly

Fictional billing ops SaaS. Fieldnote Workspace. Operator Avery Quinn. No auth. No real companies.

Catalog prices are frozen: Starter **$49**, Growth **$99**, Scale **$249**. Never invent a fourth price, live ARR, or a real customer name.

This is a **Cursor demo app** with jumpable 201 and Advanced tracks. Workflow prompts live in `lib/workflows/meta.ts` and as copy-paste blocks on `/workflows`; the presenter run-of-show is `demo-howto.md`. Project subagents live in `.cursor/agents/`. Skills live in `.cursor/skills/`. Do not add talk-track or speaker-note skills.

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

### Tests

```bash
npm test
```

One test fails on a clean tree: `tests/suggested-credit-api.test.ts` expects the client to use v2 while `lib/disputes/suggested-credit-api.ts` still selects deprecated v1. That migration is tracked on its own, so do not fix it as a drive-by. Preserve both routes and never change the test or seed to get green.

Passing tests include `tests/money.test.ts` and `tests/plans.test.ts`. Environment start seeds the database and runs only the passing tests so a red suite cannot mark the machine as failed to boot.

Shipped suite on a clean tree: **1 failed / 20 passed**. The `dsp_1043` page shows v1's $400 result; v2 and the stored credit are correctly capped at $249.

### Multi-file stub (leave it unless asked)

Incomplete on purpose:

- `lib/disputes/resolve.ts`
- `app/api/disputes/[id]/resolve/route.ts`
- `app/disputes/[id]/page.tsx` (resolution panel)

### Product constraints

- Prices only from `lib/plans.ts`.
- Customer names only from `prisma/seed.ts` and `prisma/extra-accounts.ts`.
- Comments in code must not cite Slack, GitHub, or Jira URLs.
- Do not rename Collections / Nudge / Pulse / Slatebook / Harborbill, and never reintroduce retired pre-remap names.
- Do not add Deno workflows or GitHub Actions starters. Do not add better-sqlite3.
- Do not add talk-track / speaker-note skills. Do not add a fourth catalog-solving agent. Workflow prompts live in `lib/workflows/meta.ts`.

### Agents and skills

| Path | Role |
| --- | --- |
| `.cursor/agents/ledgerly-reviewer.md` | Verifier after code changes |
| `.cursor/agents/api-instrumenter.md` | `/multitask` worker — one API route |
| `.cursor/agents/dispute-verifier.md` | `/goal` and `/orchestrate` finish line |
| `.cursor/skills/choose-cursor-workflow/` | Pick a track, then `/multitask` `/loop` `/autopilot` `/goal` `/orchestrate` |
| `.cursor/skills/dispatch-subagents/` | Parallel Task launches |
| `.cursor/skills/hand-to-cloud-agent/` | Cloud `/goal`, `/autopilot`, and `/orchestrate` |
| `.cursor/mcp.json` → `ledgerly-db` | Local read-only Prisma MCP (`mcp/ledgerly-db/`). The 101 track ends on Canvas and a slide-generating MCP, not this server. |
