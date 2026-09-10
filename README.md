# Vertical billing demo

Fictional B2B billing ops. Operator **Avery Quinn**. Catalog is Starter **$49**, Growth **$99**, Scale **$249**. Demo clock is frozen at **23 August 2026**. Synthetic data only — no real companies.

There is **no company picker in the UI**. After clone, the presenter’s first prompt selects the vertical:

```text
Start the Clinicly application
```

Profiles (each name ends in **ly**):

| Prompt | Industry |
| --- | --- |
| `Start the Clinicly application` | Healthcare provider |
| `Start the SaaSly application` | SaaS |
| `Start the Packetly application` | Network hardware (routers and switches) |

The `start-application` skill sets `lib/brand/active.ts` and reseeds. Default clone is **SaaSly**. Copy-paste runbook prompts live on `/runbooks` and interpolate the active name. The presenter run-of-show is `demo-howto.md`.

## Run

Node 20. Nothing else global.

```bash
npm i
npx prisma db seed
npm run dev
```

Open **http://localhost:43173**.

`npm test` is **1 failed / 35 passed** on a clean tree — `tests/suggested-credit-api.test.ts` is the planted API-version bug. The UI shows the deprecated v1 result of $400 for `dsp_1043`; v2 and the stored credit correctly cap at the $249 Scale price. Restore the code seam with the `reset-demo-state` skill; use `npm run db:reset` only for data.

## App

Dashboard, Invoices, Collections, Disputes, Runbooks, Settings. Extra book accounts are in `prisma/extra-accounts.ts`.

| Demo hook | Where |
| --- | --- |
| Runbook prompts | `/runbooks` (`/workflows` and `/analysis` redirect here) |
| `/loop` job | `POST` then `GET` `/api/demo/job` (~45s, not written to SQLite) |
| Agents | `.cursor/agents/` — `ledgerly-reviewer`, `api-instrumenter`, `dispute-verifier` |
| Skills | `.cursor/skills/` — play the book, or pick/dispatch a runbook |
| Presenter script | `demo-howto.md` — two tracks plus an independent beat library |

## Starter prompts

Ask:

```text
What are SaaSly's only plan prices, and which seeded invoices are overdue? Cite lib/plans.ts, prisma/seed.ts, and prisma/extra-accounts.ts.

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

## Pick a track

**201** follows the enablement deck:

1. Getting oriented with Ask
2. Repair the planted v1 client selection, then create the v2-only rule live
3. Rules, skills, and subagents
4. Model selection
5. Cloud Agents
6. Automations
7. `/multitask`, `/loop`, `/autopilot` (the current name for the deck's `/babysit`), and `/orchestrate`
8. Trust through tests, app behavior, verifiers, and human review

**Advanced** goes deeper on the same billing scenarios:

- Cursor CLI primer (`agent --trust --mode=ask` on `dsp_1043`)
- `/goal` holds dispute resolution as a durable objective
- `/multitask` dispatches isolated API workers
- `/loop` hands over local checking
- `/autopilot` drives an open PR to merge-ready — stop if there is no PR
- `/orchestrate` staffs a planner / worker / verifier tree

Every beat is independent. Open `/runbooks`, copy a card, and paste it in Cursor. You still review the result.

## Runbook prompt library

| Shape | Command | Hands over | Track |
| --- | --- | --- | --- |
| Many independent pieces | `/multitask` | breadth | 201 + Advanced |
| Just waiting on it | `/loop` | time | 201 + Advanced |
| Open PR must become merge-ready | `/autopilot` | the pull request | 201 + Advanced |
| One durable finish line | `/goal` | the objective | Advanced |
| Needs its own plan first | `/orchestrate` | the plan itself | 201 + Advanced |

`/goal` can run locally or in the cloud. `/autopilot` is the supported name for the older `/babysit` PR workflow. `/orchestrate` is a plugin (`bun` + `CURSOR_API_KEY`). `/loop` is local; use Cloud subscriptions or Automations when work must survive closing the laptop.

**`/multitask`**

```text
/multitask Add the same small request-log helper to SaaSly's four independent API surfaces: invoices, disputes, Nudge, and Pulse.

Use the dispatch-subagents skill. Launch four api-instrumenter subagents in one parallel turn — one route each:
- app/api/invoices/route.ts and app/api/invoices/[id]/route.ts
- app/api/disputes/route.ts and app/api/disputes/[id]/route.ts
- app/api/mock/nudge/route.ts
- app/api/mock/pulse/route.ts

A shared helper may live under lib/. Each worker starts with clean context; the dispatch prompt must name the files, the helper, and the constraint. After the diffs land, launch the ledgerly-reviewer subagent. Do not touch prices, prisma/seed.ts, prisma/extra-accounts.ts, lib/disputes/suggested-credit-api.ts, or tests/suggested-credit-api.test.ts. I will review one diff per task.
```

**`/loop`**

```text
/loop 10s Start the invoice backfill if it is idle (POST http://127.0.0.1:43173/api/demo/job), then GET that URL until status is complete, or until I stop the loop.

Do not add GitHub Actions. Do not write to the SaaSly database. I still review the result.
```

**`/autopilot`**

Before this beat, prepare an open pull request for the current feature branch with one actionable review comment or a scoped failing check.

```text
/autopilot Keep the pull request for the current branch merge-ready.

If this branch has no open pull request, stop and say so. Do not open a PR or merge.

Refresh the live PR state before every pass. Work in this order: merge conflicts, active unresolved review comments (including Bugbot), then failing required checks. Validate each finding before acting. Fix only issues caused by this PR and keep every change inside its scope.

Never change CI checks, workflows, the SaaSly catalog, prisma/seed.ts, prisma/extra-accounts.ts, or tests/suggested-credit-api.test.ts to get green. Preserve both suggested-credit API routes. Stop and ask if branch intent is ambiguous or a billing, security, privacy, migration, or concurrency comment needs judgment. Report ready only when the PR is mergeable, required checks are green, and every active comment is triaged. Do not merge or enable auto-merge; I still review and merge.
```

**`/goal`**

```text
/goal Make SaaSly demo-complete for dispute resolution.

1. Diagnose why the dispute page still uses the deprecated suggested-credit API, then switch lib/disputes/suggested-credit-api.ts from v1 to v2. Preserve both routes.
2. Implement resolveDispute in lib/disputes/resolve.ts.
3. Make POST /api/disputes/[id]/resolve persist ACCEPTED or DECLINED with the reviewer note.
4. Enable the Accept credit / Decline buttons on app/disputes/[id]/page.tsx.
5. Keep going across turns until npm test is fully green and http://127.0.0.1:43173/disputes/dsp_1043 shows suggested credit at or below the Scale catalog price of $249.

Do not change either suggested-credit route, prisma/seed.ts, prisma/extra-accounts.ts, or tests/suggested-credit-api.test.ts. Preserve the $400 claim. Do not invent a fourth price. When the checks pass, launch the dispute-verifier subagent to report evidence. I still review the result.
```

**`/orchestrate`**

```text
/orchestrate Make SaaSly demo-complete for dispute resolution. This is a plugin workflow — you need bun on PATH and a CURSOR_API_KEY (personal key or team service account, not a team admin key). Slack is optional.

Decompose the work. The root planner writes no code. Workers are isolated; every handoff points up. Staff at least:

- Worker: diagnose the deprecated suggested-credit client selection and switch lib/disputes/suggested-credit-api.ts from v1 to v2. Preserve both routes; do not touch tests/suggested-credit-api.test.ts or the seed.
- Worker: implement resolveDispute and POST /api/disputes/[id]/resolve.
- Worker: enable Accept / Decline on app/disputes/[id]/page.tsx.

Launch the dispute-verifier subagent as the verifier: it checks tests/suggested-credit-api.test.ts (or npm test), confirms both suggested-credit routes still work, POSTs accept/decline against dsp_1043, and loads http://127.0.0.1:43173/disputes/dsp_1043. Republish a task if a verifier fails. I still review and merge. Do not invent a fourth price.
```

| Name | Role |
| --- | --- |
| `ledgerly-reviewer` | After a change. Catalog, seed names, planted seams. |
| `api-instrumenter` | One API route per `/multitask` worker. |
| `dispute-verifier` | `/goal` / `/orchestrate` finish line. No product code. |
| `start-application` | Presenter opener. Activate Clinicly, SaaSly, or Packetly. No UI picker. |
| `choose-cursor-workflow` | Pick the command from the table above. |
| `dispatch-subagents` | Parallel Task launches. |
| `hand-to-cloud-agent` | Cloud `/goal`, `/autopilot`, or `/orchestrate`. |
| `autopilot` (built in) | Current PR-to-merge-ready skill; formerly `/babysit`. |
| `automate` (built in) | Draft a scheduled or event-triggered Cursor Automation. |

## Notes

- Prices from `lib/plans.ts` only. Customer names from the active profile in `lib/brand/` (seeded via `prisma/seed.ts`).
- Port 43173 busy: stop the old `npm run dev`. Empty dashboard: `npm run db:reset`.
