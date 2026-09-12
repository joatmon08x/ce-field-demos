# Ledgerly

Fictional B2B billing ops. Fieldnote Workspace. Operator **Avery Quinn**. Catalog is Starter **$49**, Growth **$99**, Scale **$249**. Demo clock is frozen at **23 August 2026**. Synthetic data only — no real companies.

Use it for the jumpable Cursor **101** track. Copy-paste prompts live on `/runbooks`; the presenter run-of-show and speaker notes are `demo-howto.md`. The deeper tracks were removed as not-ready.

## Run

Node 20. Nothing else global.

```bash
npm i
npx prisma db seed
npm run dev
```

Open **http://localhost:43173**.

`npm test` is **1 failed / 31 passed** on a clean tree — `tests/suggested-credit-api.test.ts` is the planted API-version bug. The UI shows the deprecated v1 result of $400 for `dsp_1043`; v2 and the stored credit correctly cap at the $249 Scale price. Restore the code seam with the `reset-demo-state` skill; use `npm run db:reset` only for data.

## App

Dashboard, Invoices, Collections, Disputes, Runbooks, Settings. Extra book accounts are in `prisma/extra-accounts.ts`.

| Demo hook | Where |
| --- | --- |
| Runbook beats | `/runbooks` (`/workflows` and `/analysis` redirect here) |
| `/loop` job | `POST` then `GET` `/api/demo/job` (~45s, not written to SQLite) |
| Agents | `.cursor/agents/` — `ledgerly-reviewer`, `api-instrumenter`, `dispute-verifier` |
| Skills | `.cursor/skills/` — run the demo or pick a Cursor workflow |
| Presenter script | `demo-howto.md` — the 101 run-of-show |

## Starter prompts

Ask:

```text
What are Ledgerly's only plan prices, and which seeded invoices are overdue? Cite lib/plans.ts, prisma/seed.ts, and prisma/extra-accounts.ts.

Explain the dispute flow end to end. What is intentionally unfinished? Cite the resolve helper, the resolve API route, and the dispute page. Do not edit any files.
```

Cmd-K on the settings description default:

```text
Rewrite this input's default value as one calm sentence explaining that the demo clock is frozen on 23 August 2026 so overdue math never drifts during a meeting. Keep it under 15 words.
```

Agent — suggested-credit API migration:

```text
Diagnose why dsp_1043 shows a $400 suggested credit even though v2 caps it at $249. Switch lib/disputes/suggested-credit-api.ts from v1 to v2. Preserve both API routes, the $400 dispute claim, and tests/suggested-credit-api.test.ts. Run the relevant tests and verify the page shows $249 from v2.
```

Then create the guardrail live:

```text
/create-rule Future code must never call /api/v1/disputes/*/suggested-credit. It must use /api/v2/disputes/*/suggested-credit. Create the project rule at .cursor/rules/suggested-credit-api-v2.mdc and show me the file before I keep it.
```

Design Mode on the dashboard KPI cards:

```text
Restyle the four KPI cards on this dashboard using only the existing design tokens in app/globals.css: a soft indigo accent on each card, stronger emphasis on the value, and a subtle hover lift. No new hex colors, no layout rewrite, no data or price changes — $49, $99, and $249 stay exactly as rendered. Touch components/kpi-card.tsx, and app/page.tsx only if you must. Two files max, nothing under lib/ or tests/. Show me the diff — I am undoing this after the demo.
```

## The 101 track

Open `/runbooks`, copy a card, and paste it in Cursor. You still review the result.

1. **What is Cursor?** — Ask, Plan, Build in Agent mode, Debug, and model choice.
2. **How do I work with an agent?** — Run Mode allowlist, redact, stop, interrupt and steer, review diffs.
3. **How do I govern my agent?** — create and test a rule, create and test a skill, Canvas, MCP / Figma.

## Agents and skills

| Name | Role |
| --- | --- |
| `ledgerly-reviewer` | After a change. Catalog, seed names, planted seams. |
| `api-instrumenter` | One API route per parallel worker. |
| `dispute-verifier` | Dispute-resolution finish line. No product code. |
| `choose-cursor-workflow` | Walk the 101 track and pick the mode or model. |
| `dispatch-subagents` | Parallel Task launches. |
| `hand-to-cloud-agent` | Hand durable work to a Cloud Agent. |
| `autopilot` (built in) | Current PR-to-merge-ready skill; formerly `/babysit`. |
| `automate` (built in) | Draft a scheduled or event-triggered Cursor Automation. |

## Notes

- Prices and customer names only from `lib/plans.ts`, `prisma/seed.ts`, and `prisma/extra-accounts.ts`.
- Port 43173 busy: stop the old `npm run dev`. Empty dashboard: `npm run db:reset`.
