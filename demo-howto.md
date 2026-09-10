# Demo howto

Presenter run-of-show, not a course. There are two tracks, and every step stands on its own, so you can start anywhere. You still review each result before it ships.

This repo is a small, fictional demo app. It exists to give Cursor enablement steps a visible surface: code to read, a UI to inspect, a scoped error to fix, and tests to verify. The data is synthetic. Avery Quinn is the operator, the only plan prices are Starter **$49**, Growth **$99**, and Scale **$249**, and the clock is frozen at **23 August 2026** so every run is repeatable. The company on screen is Clinicly, SaaSly, or Packetly — chosen by the first prompt, not a UI picker.

The pastes below match the copy-paste blocks on `/runbooks`. Deck and CLI cards show the full step text. Runbook command cards show the full `prompt` from `lib/runbooks/meta.ts`. The short `/command Read the … entry` lines are the slug-page demo prompts — the test requires them verbatim here.

## Jump menu

**Track 1 — 201**

1. Getting oriented — [demo error](#1-the-demo-error-2-min) + [Ask](#2-ask-3-min)
2. [Repair the API client](#4-agent--repair-the-api-client-5-8-min), then create the v2-only rule live
3. [Customize the Agent](#6-customize-the-agent-3-min) — rules, skills, subagents
4. [Model selection](#7-model-selection-2-min)
5. [Cloud Agents](#8-cloud-agents-3-min)
6. [Automations](#9-automations-3-min)
7. [Choose one 201 runbook](#10-runbook-command-library) — `/multitask`, `/loop`, `/autopilot`, or `/orchestrate`
8. [Trust and verification](#11-trust-and-verification-3-min)

**Track 2 — Advanced**

1. [The planted error](#1-the-demo-error-2-min)
2. Pick one or more local surfaces: [Ask](#2-ask-3-min), [Cmd-K](#3-cmd-k-2-min), [Agent](#4-agent--repair-the-api-client-5-8-min), [Design Mode](#5-design-mode-3-min)
3. [Cursor CLI primer](#advanced-cursor-cli-primer-5-min)
4. [Choose an advanced runbook](#10-runbook-command-library) — `/goal`, `/multitask`, `/loop`, `/autopilot`, or `/orchestrate`
5. [Verify](#11-trust-and-verification-3-min) and [reset](#12-close)

Jump directly to any step. Each section states its prerequisite; you do not need to run earlier sections first.

---

## How to narrate

For a novice audience, narrate each step in this order:

- **Before:** “Here is the task and the boundary I am giving Cursor.”
- **During:** “Cursor is reading, editing, or checking. I can inspect each action.”
- **After:** “Here is the evidence. I decide whether the result ships.”

Then add the engineering point: why the task is hard, what Cursor takes on, and why the evidence matters. Do not read prompts aloud. State the intent, paste from the card or this script, then narrate what changed in plain language.

Use these definitions when the audience is new:

- **Ask:** reads and explains; it does not edit.
- **Agent:** can inspect, edit, and run checks within the boundary you give it.
- **Rule:** an always-on project guardrail.
- **Skill:** a reusable set of instructions for a kind of task.
- **Subagent:** a focused worker with its own context.
- **Verifier:** checks the result independently; it does not decide to ship.

---

## Before you start

Presenter opener (no in-app picker):

```text
Start the Clinicly application
```

Also valid: `Start the SaaSly application` or `Start the Packetly application`. The `start-application` skill writes `lib/brand/active.ts` and reseeds.

```bash
npm i
npx prisma db seed
npm run dev
```

Open **http://localhost:43173**.

Check shipped state:

- `npm test` is **1 failed / 35 passed**; the sole failure is `tests/suggested-credit-api.test.ts`
- [http://127.0.0.1:43173/disputes/dsp_1043](http://127.0.0.1:43173/disputes/dsp_1043) shows **Suggested credit $400.00** in red, above the Scale price of **$249**
- The deprecated v1 route returns the $400 claim; v2, the domain helper, the seed, and the MCP store the correct $249 credit
- Accept credit / Decline are disabled — that unfinished resolution UI is separate from the planted API-version error

If the credit reads $249.00 or the suite is all green, a prior run switched the client to v2. Restore with the `reset-demo-state` skill, or:

```bash
git checkout -- lib/disputes/suggested-credit-api.ts
npx prisma db seed
```

Port 43173 busy: stop the old `npm run dev`. Empty dashboard: `npm run db:reset`.

---

## Through-line

> The billing demo is the surface, not the lesson. It has one known error that connects the seed, application code, UI, and test. The 201 track uses that surface to explain Cursor concepts. The Advanced track gives Cursor more ownership over the same bounded work. I still review what ships.

---

## 1. The demo error (2 min)

**Open:** [dsp_1043](http://127.0.0.1:43173/disputes/dsp_1043). The dashboard and Collections page are optional context.

**Do:** Point at **Suggested credit $400.00**, then **Scale catalog price $249.00**.

**Why:** One concrete error keeps the demo easy to follow. **Benefit:** Every enablement step can use the same visible example. **Why it matters:** The audience can focus on how Cursor works instead of learning a product.

**Say — novice version:**

> This is a fictional billing app we use for this demo. It contains one known error on purpose.
>
> This invoice costs $249, but the dispute claims $400. The current v2 API caps the suggested credit at $249. The page still calls deprecated v1, which returns the $400 claim. That is why the page shows a red warning and one test is red.
>
> The mismatch crosses the API routes, client, page, and test. We will use that connection to show how Cursor diagnoses, changes, and verifies a codebase without deleting compatibility code.

**How the error correlates:**

| Layer | File | What it proves |
| --- | --- | --- |
| Demo data | `prisma/seed.ts` | `dsp_1043` claims $400 against `inv_1043`, a $249 Scale invoice |
| Correct domain logic | `lib/dispute-credit.ts` | Caps suggested credit at the catalog plan price |
| Stored state | `prisma/seed.ts`, `mcp/ledgerly-db/queries.ts` | Records and reports the correct $249 credit even while the live UI shows v1's $400 response |
| Versioned APIs | `app/api/v1/disputes/[id]/suggested-credit/route.ts`, `app/api/v2/disputes/[id]/suggested-credit/route.ts` | v1 returns the $400 claim for compatibility; v2 returns $249 |
| Faulty client selection | `lib/disputes/suggested-credit-api.ts` | Selects deprecated v1, so the UI displays $400 |
| Expected behavior | `tests/suggested-credit-api.test.ts` | Expects the client to select v2 |

**Look for:** Red **Suggested credit $400.00**, copy stating it came from v1 and is above **$249.00**, and disabled Accept / Decline buttons. Those buttons are a separate unfinished seam; do not confuse them with the API-version error.

---

## 2. Ask (3 min)

**Open:** Cursor chat in **Ask** mode. Leave the app on the dashboard or the dispute.

**Why:** Unfamiliar repos are expensive to learn. **Benefit:** Ask explains from source without editing. **Why it matters:** Engineers build confidence before acting.

**Say — novice version:**

> I am starting in Ask mode because I want an explanation before any code changes. Cursor can read the repository and cite the files it used, but it cannot edit them in this mode. I will use its answer to connect the red page to the deprecated client selection and the failing test.

**Paste** (same block as the Getting oriented card):

```text
What are SaaSly's only plan prices, and which seeded invoices are overdue? Cite lib/plans.ts, prisma/seed.ts, and prisma/extra-accounts.ts.

Explain the dispute flow end to end. What is intentionally unfinished? Cite the resolve helper, the resolve API route, and the dispute page. Do not edit any files.
```

**Look for:** Citations to `lib/plans.ts`, `prisma/seed.ts`, and `prisma/extra-accounts.ts`; `INV-1043` among the overdue invoices; the resolve stub named separately from the API-version error; no edits.

**Say after it answers:**

> Cursor explained the behavior from source instead of guessing from the screen. The answer identified the seeded invoice and the separate unfinished resolution path. The correlation table above shows the deprecated client selection and its test.

---

## 3. Cmd-K (2 min)

**Open:** [Settings](http://127.0.0.1:43173/settings). Select the timezone input default: `UTC — demo clock is frozen`.

**Why:** Small edits should stay small. **Benefit:** Cmd-K keeps intent and review local. **Why it matters:** Less context switching and scope growth.

**Say:**

> Inline edit. I am not asking the Agent to roam the repo. One field, one sentence, under 15 words.

**Paste** into Cmd-K (Ctrl-K on Windows):

```text
In under 15 words, explain that the clock is frozen on 23 August 2026 so overdue math never drifts.
```

**Look for:** The input default rewrites in place. Leave the webhook **Tab** seam alone unless that is an optional step.

**Say:**

> That TODO is intentional, like the disabled Accept / Decline controls. Both are small editing seams. Neither one is the planted suggested-credit API-version error.

---

## 4. Agent — repair the API client (5-8 min)

Skip this step if the advanced command will be `/goal` or `/orchestrate` (they include this migration plus the resolution stub).

**Open:** Agent. Keep [dsp_1043](http://127.0.0.1:43173/disputes/dsp_1043) visible.

**Why:** End-to-end work crosses layers. **Benefit:** Agent traces, edits, and verifies the path. **Why it matters:** Explicit boundaries keep it reviewable.

**Say:**

> Ask only explained the code. Agent can change it. I am asking it to diagnose the version mismatch and change only the client selection. Both API routes stay available.

**Paste:**

```text
Diagnose why dsp_1043 shows a $400 suggested credit even though v2 caps it at $249. Switch lib/disputes/suggested-credit-api.ts from v1 to v2. Preserve both API routes, the $400 dispute claim, and tests/suggested-credit-api.test.ts. Run the relevant tests and verify the page shows $249 from v2.
```

**Look for:** One client-version edit. Both v1 and v2 route tests still pass. `tests/suggested-credit-api.test.ts` turns green. The page shows **$249** from v2.

**Say:**

> I review the diff before it is real. The compatibility route remains; only the client moved.

**Then paste this `/create-rule` prompt:**

```text
/create-rule Future code must never call /api/v1/disputes/*/suggested-credit. It must use /api/v2/disputes/*/suggested-credit. Create the project rule at .cursor/rules/suggested-credit-api-v2.mdc and show me the file before I keep it.
```

**Look for:** A proposed project rule under `.cursor/rules/`. This is a live manual beat; do not add the rule to the shipped repository.

---

## 5. Design Mode (3 min)

**Open:** Dashboard. Design Mode if you have it; same prompt in Agent if you do not.

**Why:** UI iteration loses time to edit-refresh cycles. **Benefit:** Design Mode makes visual intent direct. **Why it matters:** File and token limits preserve the system.

**Say:**

> Visual only. Existing tokens. I am undoing this when we are done. $49, $99, and $249 stay on the cards.

**Paste:**

```text
Restyle the four KPI cards with existing tokens: soft indigo, stronger values, subtle hover lift. Two files max; no data or price changes. Show the diff.
```

**Look for:** Two files max. No new hex. No data change. Show the diff, then revert before the next demo.

**Say:**

> Design Mode is not a product decision. The catalog did not move.

---

## 6. Customize the Agent (3 min)

**Prerequisite:** None. This step is read-only.

**Why:** Repeating standards in prompts is fragile. **Benefit:** Rules guard, skills repeat, subagents isolate. **Why it matters:** Good practice survives across tasks.

**Open side by side:**

- `.cursor/rules/ledgerly.mdc`
- `.cursor/skills/choose-cursor-workflow/SKILL.md`
- `.cursor/agents/api-instrumenter.md`

**Say — novice version:**

> These are three different ways to give Cursor context. A rule is always on for this project. A skill is a reusable playbook we choose for a task. A subagent is a focused worker given one bounded assignment. Together they keep important constraints out of ad hoc prompts.

**Paste** (same block as the Rules, skills, subagents card):

```text
Open .cursor/rules/ledgerly.mdc, .cursor/skills/choose-cursor-workflow/SKILL.md, and .cursor/agents/api-instrumenter.md. Explain how rules, skills, and subagents differ in this repo. Do not edit them.
```

**Show:** The rule blocks invented prices. The skill distinguishes `/autopilot` from `/goal`. The worker is allowed to touch one named API surface and nothing else.

**Land:** Rules constrain every step; skills encode repeatable methods; subagents isolate work and context.

---

## 7. Model selection (2 min)

**Prerequisite:** Open a new Agent chat so the model picker is visible. Point at **Auto** if it is listed — that is Cursor Router, not a single named model.

**Why:** One model is not optimal everywhere, and most people should not have to pick a model on every turn. **Benefit:** Pin a model when the role is known; use Auto / Router when the next request's difficulty is not. **Why it matters:** Better speed and cost without lowering verification.

**Say — novice version:**

> The model picker has named models and, on Teams and Enterprise, Auto. Auto is Cursor Router. Not every request needs a frontier model, so the router classifies the task and sends simple work to faster, cheaper models and harder work to more capable ones. Under Auto you Optimize For Cost, Balance, or Intelligence — Cost favors token spend, Balance mixes quality and cost, Intelligence uses stronger models for harder tasks at less than pinning one frontier model all day. Benefits: you do not memorize which model to use; cost follows the work; you can still pin a model when the split is already known. For this /multitask I would pin a high-reasoning parent to plan and coordinate, and a faster model on each worker that has one route and one check. If Auto is missing, say so — Router may be off for this org — and pick named models instead.

**Paste** (same block as the Model selection card):

```text
Look at the models available in this Cursor session (the chat picker, and cursor.com/docs/models or cursor.com/docs/cursor-router if you need current labels). Then recommend a concrete split for SaaSly /multitask:

1. Parent — one current high-reasoning / thinking model from the picker. It has to decompose four API surfaces, write a dispatch that names files + helper + constraints, and launch ledgerly-reviewer after the diffs.
2. Each api-instrumenter worker — one current faster focused model from the picker. One named route, a small helper under lib/, no catalog, seed, suggested-credit client, or intentional test edits.
3. Auto / Cursor Router — if Auto is in the picker, name the Optimize For mode you would use (Cost, Balance, or Intelligence) for day-to-day vs this /multitask parent, and why. Router classifies each request and sends simple work to efficient models and harder work to more capable ones. If Auto or Router is missing, say so (Teams/Enterprise; Enterprise admins may have it off) and stay with named models.

Name the exact picker labels you would select today and why each fits. If a label is missing on this account, say so and pick the next best available option. Do not invent a model. Do not write model slugs into the repo — this is a picker recommendation only. Say where to set them: the parent chat picker, and the model on each Task / api-instrumenter launch (or inherit if the worker should match the parent).
```

**Look for:** Auto in the picker, plus Cost / Balance / Intelligence if present. Exact current picker labels. Parent vs worker split, or Auto when the next request is unknown. Where to set them. No invented model. No slugs written into the repo.

**Land:** Router chooses per request so you do not have to. Pin a high-reasoning parent and focused workers when those roles are already known. Verification stays independent of model choice.

---

## 8. Cloud Agents (3 min)

**Prerequisite:** The branch and required setup must be available remotely. `.cursor/environment.json` installs dependencies, seeds the database, and starts the app on port 43173.

**Why:** Local work stops with the session. **Benefit:** Cloud Agents are isolated and durable. **Why it matters:** Engineers hand off bounded work and return to evidence.

**Say — novice version:**

> A Cloud Agent runs the task on a separate computer managed by Cursor, so the work can continue without this laptop staying open. It still needs a bounded objective and still returns changes for review. I will draft the instructions first and will not launch anything during this explanation.

**Paste** (same block as the Cloud Agents card):

```text
Use the hand-to-cloud-agent skill. Explain how to hand this SaaSly repo to a Cloud Agent. Cite .cursor/environment.json (install, seed, port 43173). Draft the exact objective you would send: /autopilot if there is an open PR, otherwise a bounded /goal or /orchestrate that switches the suggested-credit client from v1 to v2, preserves both routes, finishes dispute resolution, and gets npm test green. Do not launch a Cloud Agent unless I confirm the environment is ready. Do not invent a fourth price.
```

**Do:** Review the draft. Launch only if you confirm the environment is ready.

- **201:** `/autopilot` keeps an existing PR merge-ready; `/orchestrate` runs planner, workers, and verifier in isolated environments.
- **Advanced:** `/goal` can make dispute resolution pass its test and browser check. `/autopilot` and `/orchestrate` remain available.

**Look for:** Cites `.cursor/environment.json`. On 201, use `/autopilot` for a real open PR or `/orchestrate` when planning and staffing are required. `/goal` is Advanced-only. No launch unless you confirm. No fourth price.

**Land:** Cloud changes where work runs and how long it can persist. It does not remove the human review gate.

---

## 9. Automations (3 min)

**Prerequisite:** Use Cursor's Agents Window. This step opens the Automations editor; it does not add a GitHub Actions file.

**Why:** People forget repeatable checks. **Benefit:** Automations run on events or schedules. **Why it matters:** Proven workflows become governed systems.

**Say — novice version:**

> A loop repeats while this session is open. An Automation starts from an event or schedule and can run later without me watching. I first prove the instructions interactively; then I can turn the proven workflow into an Automation.

**Paste** (same block as the Automations card):

```text
/automate Create a PR-triggered Cursor Automation that reviews SaaSly guardrails and leaves an evidence-backed comment. Review only; do not modify code, tests, seed, or CI. Use the automate skill. Draft only — do not save or enable the automation. Do not add a GitHub Actions file. If the Automations editor is not available, say so and stop.
```

**Do:** Review the draft. Open the Automations editor if it appears. Do not save or enable unless that is part of the live demo. If the editor is missing, stop.

**Land:** Automations are repeatable cloud workflows. They are not local shell loops and they do not require adding CI files to this repo.

---

## Advanced: Cursor CLI primer (5 min)

This step is Advanced-only and stands on its own.

**Prerequisite:** Cursor CLI is installed and signed in. Open a terminal at the repository root. The app and seed do not need to be running.

**Why:** Some work starts in a terminal, remote environment, or script. **Benefit:** Cursor Agent can use the same repository context without moving the task into the editor. **Why it matters:** Engineers can choose the interface that fits the work while keeping review and approval visible.

**Primer:**

- Ask mode is read-only; Agent mode can edit files and run commands with approval.
- `/model` changes the model for the current session.
- `agent -p` runs non-interactively for scripts; `--force` permits actions without confirmation, so do not use it live.

**Check setup:**

```bash
agent --version
agent status
```

If the CLI is missing, install it before the demo from [cursor.com/docs/cli/installation](https://cursor.com/docs/cli/installation). If it is signed out, run `agent login`. A new clone needs `--trust` on first Ask; that is not `--force`.

**Say — novice version:**

> The CLI is the same Cursor Agent in a terminal. I am starting it in Ask mode, so it can explain the repository but cannot edit it. `--trust` confirms that this folder is allowed; it is not permission to bypass review.

**Run:**

```bash
agent --trust --mode=ask "Explain why dsp_1043 shows a $400 suggested credit even though the stored credit and v2 response are $249. Cite the source files and do not edit anything."
```

While the session is open:

1. Run `/model` and point out that model choice is explicit.
2. Ask: `Which file must change to move the client from v1 to v2, and which files remain for dispute resolution? Do not edit them.`
3. Review the cited files and proposed boundary.
4. Press Ctrl-C to leave the session.

**Look for:** `prisma/seed.ts` preserves the $400 claim, `lib/dispute-credit.ts` caps correctly, `lib/disputes/suggested-credit-api.ts` selects v1, and the resolution stub spans the library, API route, and panel. No files change.

**Land:** Interactive CLI is for a reviewed conversation; `agent -p` is the non-interactive form for scripts. Approval boundaries still matter, so reserve `--force` for deliberate automation rather than the live demo.

---

## 10. Runbook command library

**Open:** [http://127.0.0.1:43173/runbooks](http://127.0.0.1:43173/runbooks). Each command card already shows the full `prompt`. The short line below is the slug-page demo prompt — it tells the agent to load that same instruction.

**Why:** Work has different shapes. **Benefit:** Choose the right ownership boundary. **Why it matters:** Delegate toil without delegating judgment.

**Say — novice version:**

> These commands hand over different kinds of work. `/multitask` handles independent pieces, `/loop` handles waiting, `/autopilot` watches one pull request, `/goal` owns a finish line, and `/orchestrate` first creates and staffs a plan. The command changes what Cursor owns, not who approves the result.

| If the work is… | Command | Hands over | Track |
| --- | --- | --- | --- |
| Many independent pieces | `/multitask` | breadth | 201 + Advanced |
| Just waiting on a job | `/loop` | time | 201 + Advanced |
| An open PR must become merge-ready | `/autopilot` | the pull request | 201 + Advanced |
| One durable finish line | `/goal` | the objective | Advanced |
| Needs its own plan first | `/orchestrate` | the plan itself | 201 + Advanced |

`/loop` is local. `/goal` can run locally or in the cloud. `/autopilot` needs a real open PR. `/orchestrate` is a plugin (`bun` + `CURSOR_API_KEY`).

Run one, or jump directly to the one named in the deck discussion.

### 10a. `/multitask` — breadth

**Why:** Independent work queues unnecessarily. **Benefit:** Workers run in parallel. **Why it matters:** More throughput with one clear diff per task.

**Say:**

> Four API surfaces, no shared diff. I am not going to sit and do them in series. Four workers, then a reviewer. I read one diff per task.

**Short prompt:**

```text
/multitask Read the multitask entry in RUNBOOKS from lib/runbooks/meta.ts and run its prompt exactly.
```

**Detailed prompt:** [Open `/runbooks/commands/multitask`](http://127.0.0.1:43173/runbooks/commands/multitask)

**Fallback:** If Cursor does not open `lib/runbooks/meta.ts`, use **Copy full prompt** on that page.

**Look for:** Four `api-instrumenter` launches in one turn. A shared helper under `lib/`. `ledgerly-reviewer` after the diffs. No price or seed edits.

### 10b. `/loop` — time

**Why:** Re-checking steals attention. **Benefit:** A loop handles the waiting. **Why it matters:** Engineers stay focused and control when it stops.

**Say:**

> I would otherwise sit and watch a 45-second job. I start it, then hand over the checking. I still stop the loop.

**Short prompt:**

```text
/loop Read the loop entry in RUNBOOKS from lib/runbooks/meta.ts and run its prompt exactly.
```

**Detailed prompt:** [Open `/runbooks/commands/loop`](http://127.0.0.1:43173/runbooks/commands/loop)

**Fallback:** If Cursor does not open `lib/runbooks/meta.ts`, use **Copy full prompt** on that page.

**Look for:** The paste starts with `/loop 10s`. `idle` → `running` → `complete`. Nothing written to SQLite. No GitHub Actions. Dev server must be on 43173.

### 10c. `/autopilot` — the pull request

The 201 deck calls this `/babysit`. The current supported name is `/autopilot`.

**Prerequisite:** Prepare an open pull request for the current feature branch with one actionable review comment or a scoped failing required check. Do not run this step on `main`.

**Why:** PR readiness is a coordination loop. **Benefit:** Autopilot handles clear review and CI work. **Why it matters:** Ambiguity and merging stay human decisions.

**Say:**

> This is not a generic goal. It is one real pull request. If this branch has no open PR, Autopilot should stop and say so — it must not open one. Autopilot refreshes live state, handles conflicts before comments before CI, and stops at merge-ready. I still merge.

**Short prompt:**

```text
/autopilot Read the autopilot entry in RUNBOOKS from lib/runbooks/meta.ts and run its prompt exactly.
```

**Detailed prompt:** [Open `/runbooks/commands/autopilot`](http://127.0.0.1:43173/runbooks/commands/autopilot)

**Fallback:** If Cursor does not open `lib/runbooks/meta.ts`, use **Copy full prompt** on that page.

**Look for:** If there is no open PR, the agent stops and says so. Otherwise: fresh PR state on every pass. Conflicts first, then active comments, then CI. Findings are validated rather than obeyed blindly. No CI weakening or unrelated fixes. The run stops at merge-ready. Does not open or merge a PR.

### 10d. `/goal` — the objective

**Why:** Long objectives lose continuity. **Benefit:** A goal preserves the finish condition. **Why it matters:** The engineer can steer without restating the objective.

**Say:**

> One objective: make dispute resolution demo-complete. Move the suggested-credit client from v1 to v2, preserve both routes, wire resolve, enable the buttons, and keep going until the checks pass. The agent judges the finish line. I review.

**Short prompt:**

```text
/goal Read the goal entry in RUNBOOKS from lib/runbooks/meta.ts and run its prompt exactly.
```

**Detailed prompt:** [Open `/runbooks/commands/goal`](http://127.0.0.1:43173/runbooks/commands/goal)

**Fallback:** If Cursor does not open `lib/runbooks/meta.ts`, use **Copy full prompt** on that page.

**Look for:** Suggested credit on dsp_1043 at **$249** from v2. Both routes remain. `npm test` is green. `dispute-verifier` reports evidence. Seed and `tests/suggested-credit-api.test.ts` are untouched.

If the run must survive closing the laptop, use the `hand-to-cloud-agent` skill.

### 10e. `/orchestrate` — the plan itself

Need `bun` on PATH and a `CURSOR_API_KEY` (personal key or team service account, not a team admin key). Slack is optional.

**Why:** Some goals are too large for one task. **Benefit:** Orchestration delegates planning and staffing. **Why it matters:** Isolated workers and verifiers keep the plan converging.

**Say:**

> Same outcome as /goal, but the work needs a plan first. A root planner writes no code. Isolated workers. A verifier. I still review and merge.

**Short prompt:**

```text
/orchestrate Read the orchestrate entry in RUNBOOKS from lib/runbooks/meta.ts and run its prompt exactly.
```

**Detailed prompt:** [Open `/runbooks/commands/orchestrate`](http://127.0.0.1:43173/runbooks/commands/orchestrate)

**Fallback:** If Cursor does not open `lib/runbooks/meta.ts`, use **Copy full prompt** on that page.

**Look for:** Planner does not write product code. Three workers, then `dispute-verifier`. Same finish line as `/goal`.

---

## 11. Trust and verification (3 min)

**Prerequisite:** Use the checks appropriate to the step you ran.

**Why:** Agent count is not trust. **Benefit:** Verification produces layered evidence. **Why it matters:** Teams scale delegation without losing accountability.

**Say — novice version:**

> More agents do not automatically mean more trust. Trust comes from layers: project rules prevent known mistakes, a narrow worker limits scope, tests check behavior, the app shows the user result, and a verifier checks independently. I still read the diff and decide what ships.

**Show four layers:**

1. **Guardrail:** `.cursor/rules/ledgerly.mdc`
2. **Narrow worker:** `.cursor/agents/api-instrumenter.md`
3. **Independent verifier:** `.cursor/agents/dispute-verifier.md`
4. **Human gate:** diff review and merge decision

**Paste** (same block as the Trust and verification card):

```text
Run npm test and report which tests passed and which failed. Do not edit any files.

On a clean tree, npm test is 1 failed / 35 passed. The sole red test is tests/suggested-credit-api.test.ts because the client intentionally selects deprecated v1. Do not change the test, either route, or the seed.
```

**If `/goal` or `/orchestrate` completed dispute resolution:** `npm test` should be fully green. Load dsp_1043 and confirm suggested credit is **$249** from v2, both routes remain, and Accept / Decline work.

**If no client-migration step ran:** `npm test` should remain **1 failed / 35 passed**. That is shipped state, not failed setup. Do not let the agent edit the intentional test.

**Land:** A green check is evidence, not permission to merge. The presenter remains accountable.

---

## 12. Close

**Why:** Demos drift after edits. **Benefit:** Reset restores deterministic state. **Why it matters:** Every audience sees the same proof points.

**Say:**

> I reviewed the result. Now I am resetting the demo app so the next session starts with the same planted v1 client, the same $400 UI result, and the same expected red test.

**Do:** Ask the agent to run `reset-demo-state`, or:

```bash
git checkout -- lib/disputes/suggested-credit-api.ts
rm -f .cursor/rules/suggested-credit-api-v2.mdc
git checkout -- .
npx prisma db seed
npm test
```

Only run `git checkout -- .` if you mean to drop **all** local changes.

**Shipped state again:** suggested credit **$400.00** from v1 on dsp_1043, v2 and stored credit **$249.00**, suite **1 failed / 35 passed**.

---

## Do not

- Invent a fourth price, ARR, or a real customer
- “Correct” the $400 claim on dsp_1043 or the seed
- Touch `tests/suggested-credit-api.test.ts` to make the migration pass
- Delete or change either suggested-credit API route
- Commit a KPI restyle to `main`
- Run `/loop` in the cloud, or `/orchestrate` without `bun` and a key
- Launch a Cloud Agent unless you confirm the environment is ready
- Save or enable an Automation unless that is the live step
- Treat a green verifier as a ship decision

---

## 201 short path (20–25 min)

1. Demo error + Ask — connect the UI, versioned routes, client, seed, and test
2. Repair the client from v1 to v2 unless `/orchestrate` is the chosen workflow; after the migration, paste the `/create-rule` guardrail prompt
3. Open one shipped rule, one skill, one subagent
4. Explain model choice in the picker
5. Draft the Cloud Agent brief; open an Automation draft if time allows — do not launch or save unless that is the step
6. Run one: `/multitask`, `/loop`, `/autopilot`, or `/orchestrate`
7. Show the verification layers
8. Reset

## Advanced short path (20–30 min)

1. Demo error — dsp_1043 ($400 vs $249)
2. One local surface: Ask, Cmd-K, Agent, or Design
3. Run the Cursor CLI primer
4. Run `/goal`, or jump to another runbook from `/runbooks`
5. Show verifier evidence and review the diff
6. Reset
