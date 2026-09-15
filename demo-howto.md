# Ledgerly demo howto

Presenter run-of-show for the **101** and **201** tracks, not a course. Every step stands on its own, so you can start anywhere. You still review each result before it ships.

Ledgerly is a small, fictional demo app. It exists to give Grok Build enablement steps a visible surface: code to read, a UI to inspect, a scoped error to fix, and tests to verify. The data is synthetic. Avery Quinn is the operator, the only plan prices are Starter **$49**, Growth **$99**, and Scale **$249**, and the clock is frozen at **23 August 2026** so every run is repeatable.

The pastes below match the copy-paste blocks on `/runbooks/101` and `/runbooks/201`. Each beat is independent; jump directly to any step.

## Jump menu

The 101 track has three sections. Open `/runbooks/101` and copy a card for any beat.

1. **What is Grok Build?** — [Ask](#ask), [Plan](#plan), [Build in Agent mode](#build-in-agent-mode), [Debug](#debug), model choice
2. **How do I work with an agent?** — allowlist, redact, stop, interrupt and steer, review diffs, restore from a checkpoint
3. **How do I govern my agent?** — [create a rule](#create-a-rule), create a skill, [Canvas](#canvas), [MCP / Figma](#mcp--figma)

The 201 track has four sections. Open `/runbooks/201` and copy a card for any beat.

1. **Why is my agent ignoring my instructions?** — rename agents, Canvas DDD, ask across chats, context usage
2. **How do I standardize agent behavior?** — [create-api skill](#create-api-skill), promote it, money-formatting hook
3. **How does my agent get more information?** — [private Linear team](#create-the-private-linear-team-manual), Linear MCP, ce-field-demos suggested-credit issue, import `plugins/standard-bug-fix` from disk
4. **How do I parallelize a task?** — [three-worktree plan](#refine-the-plan), `/multitask`, verify, `/best-of-n`

---

## How to narrate

For a novice audience, narrate each step in this order:

- **Before:** "Here is the task and the boundary I am giving Grok Build."
- **During:** "Grok Build is reading, editing, or checking. I can inspect each action."
- **After:** "Here is the evidence. I decide whether the result ships."

Then add the engineering point: why the task is hard, what Grok Build takes on, and why the evidence matters. Do not read prompts aloud. State the intent, paste from the card, then narrate what changed in plain language.

Use these definitions when the audience is new:

- **Ask:** reads and explains; it does not edit.
- **Agent:** can inspect, edit, and run checks within the boundary you give it.
- **Rule:** an always-on project guardrail.
- **Skill:** a reusable set of instructions for a kind of task.

---

## Before you start

```bash
npm i
npx prisma db seed
npm run dev
```

Open **http://localhost:43173**.

Check shipped state:

- `npm test` is **1 failed / 29 passed**; the sole failure is `tests/suggested-credit-api.test.ts`
- [http://127.0.0.1:43173/disputes/dsp_1043](http://127.0.0.1:43173/disputes/dsp_1043) shows **Suggested credit $400.00** in red, above the Scale price of **$249**
- The deprecated v1 route returns the $400 claim; v2, the domain helper, and the seed store the correct $249 credit
- Accept credit / Decline are disabled — that unfinished resolution UI is separate from the planted API-version error
- Invoice and dispute status pills write `?state=` while the pages read `status` — clicking Overdue / Needs review does not filter. That is a planted UI seam, not a second red test. Restore with `git checkout -- components/filter-pills.tsx`

If the credit reads $249.00 or the suite is all green, a prior run switched the client to v2. If status pills filter the list, a prior run renamed `state` to `status`. Restore with the `reset-demo-state` skill, or:

```bash
git checkout -- lib/disputes/suggested-credit-api.ts
git checkout -- components/filter-pills.tsx
npx prisma db seed
```

Port 43173 busy: stop the old `npm run dev`. Empty dashboard: `npm run db:reset`.

### Create the private Linear team (manual)

Linear MCP cannot create teams. Do this in the Linear UI **before** the 201 MCP section, on the presenter’s account only.

1. Open Linear → **Settings → Teams → New team**.
2. Name it for this operator only (example: `{displayName}-field-demos`).
3. Turn on **Make team private**. Team key can be **LY**. Confirm it at `https://linear.app/<workspace>/settings/teams/LY`.
4. Members: **only you**. Do not add any other team.
5. In Grok Build, run `stage-linear-201`. That skill creates or reconciles project `ce-field-demos` on this team with exactly three Fieldnote issues.

Do not skip the private-team step. A project on a public team is visible to that team.

---

## The demo error (2 min)

**Open:** [dsp_1043](http://127.0.0.1:43173/disputes/dsp_1043). The dashboard and Collections page are optional context.

**Do:** Point at **Suggested credit $400.00**, then **Scale catalog price $249.00**.

**Why:** One concrete error keeps the demo easy to follow. **Benefit:** Every enablement step can use the same visible example. **Why it matters:** The audience can focus on how Grok Build works instead of learning a product.

**Say — novice version:**

> Ledgerly is a fictional billing app we use for this demo. It contains one known error on purpose. This invoice costs $249, but the dispute claims $400. The current v2 API caps the suggested credit at $249. The page still calls deprecated v1, which returns the $400 claim. That is why the page shows a red warning and one test is red.

**How the error correlates:**

| Layer | File | What it proves |
| --- | --- | --- |
| Demo data | `prisma/seed.ts` | `dsp_1043` claims $400 against `inv_1043`, a $249 Scale invoice |
| Correct domain logic | `lib/dispute-credit.ts` | Caps suggested credit at the catalog plan price |
| Versioned APIs | `app/api/v1/disputes/[id]/suggested-credit/route.ts`, `app/api/v2/disputes/[id]/suggested-credit/route.ts` | v1 returns the $400 claim for compatibility; v2 returns $249 |
| Faulty client selection | `lib/disputes/suggested-credit-api.ts` | Selects deprecated v1, so the UI displays $400 |
| Expected behavior | `tests/suggested-credit-api.test.ts` | Expects the client to select v2 |

**Look for:** Red **Suggested credit $400.00**, copy stating it came from v1 and is above **$249.00**, and disabled Accept / Decline buttons. Those buttons are a separate unfinished seam; do not confuse them with the API-version error. Status pills on `/invoices` and `/disputes` are a third seam: they write `state=` so a click does not filter.

---

## Ask

**Open:** Grok Build chat in **Ask** mode. Leave the app on the dashboard or the dispute.

**Why:** Unfamiliar repos are expensive to learn. **Benefit:** Ask explains from source without editing. **Why it matters:** Engineers build confidence before acting.

**Paste** (same block as the first-prompt card):

```text
What are Ledgerly's only plan prices, and which seeded invoices are overdue? Cite lib/plans.ts, prisma/seed.ts, and prisma/extra-accounts.ts.

Explain the dispute flow end to end. What is intentionally unfinished? Cite the resolve helper, the resolve API route, and the dispute page. Do not edit any files.
```

**Look for:** Citations to `lib/plans.ts`, `prisma/seed.ts`, and `prisma/extra-accounts.ts`; the resolve stub named separately from the API-version error; no edits.

---

## Plan

**Open:** Plan mode. **Why:** Mapping the approach first keeps the change scoped.

**Paste:**

```text
/plan I want a new feature to update the customer email in the invoice detail customer card. Don’t implement email validation.
```

**Look for:** A short plan that names the files it would touch and defers validation.

---

## Build in Agent mode

**Open:** Agent (the default). Keep [dsp_1043](http://127.0.0.1:43173/disputes/dsp_1043) visible.

**Why:** End-to-end work crosses layers. **Benefit:** Agent traces, edits, and verifies the path. **Why it matters:** Explicit boundaries keep it reviewable.

**Paste:**

```text
Diagnose why dsp_1043 shows a $400 suggested credit even though v2 caps it at $249. Switch lib/disputes/suggested-credit-api.ts from v1 to v2. Preserve both API routes, the $400 dispute claim, and tests/suggested-credit-api.test.ts. Run the relevant tests and verify the page shows $249 from v2.
```

**Look for:** One client-version edit. Both v1 and v2 route tests still pass. `tests/suggested-credit-api.test.ts` turns green. The page shows **$249** from v2.

---

## Debug

**Open:** Debug mode. **Why:** Verify a change and investigate any failure with runtime evidence.

**Paste:**

```text
/debug the failing test
```

**Look for:** A hypothesis, an instrumented check, and a fix grounded in the actual failure.

---

## Create a rule

**Why:** Repeating standards in prompts is fragile. **Benefit:** A rule is always on for this project.

**Paste:**

```text
/create-rule Future code must never call /api/v1/disputes/*/suggested-credit. It must use /api/v2/disputes/*/suggested-credit. Create the project rule at .cursor/rules/suggested-credit-api-v2.mdc and show me the file before I keep it.
```

**Look for:** A proposed project rule under `.cursor/rules/`. This is a live manual beat; do not add the rule to the shipped repository.

---

## Canvas

**Why:** Some results are easier to show than tell. **Benefit:** Canvas renders an interactive artifact next to the chat.

**Paste:**

```text
Create a canvas explaining what we did today.
```

---

## MCP / Figma

**Why:** Grok Build can drive external tools through MCP. **Benefit:** Generate slides for a showcase without leaving the editor.

Enable a Figma MCP server: **Customize > MCP > Figma**, then:

```text
Create three slides in Figma Slides outlining how I used Grok Build to develop a new feature. I want to use this as part of my demo showcase.
```

---

## Verify

**Paste:**

```text
Run npm test and report which tests passed and which failed. Do not edit any files.

On a clean tree, npm test is 1 failed / 29 passed. The sole red test is tests/suggested-credit-api.test.ts because the client intentionally selects deprecated v1. Do not change the test, either route, or the seed.
```

**If the client migration ran:** `tests/suggested-credit-api.test.ts` should be green and dsp_1043 should show **$249** from v2, with both routes intact.

**If no migration ran:** `npm test` should remain **1 failed / 29 passed**. That is shipped state, not failed setup.

**Land:** A green check is evidence, not permission to merge. The presenter remains accountable.

---

## Close

**Say:**

> I reviewed the result. Now I am resetting the demo app so the next session starts with the same planted v1 client, the same $400 UI result, the same expected red test, and status pills that still write `state=`.

**Do:** Ask the agent to run `reset-demo-state`, or:

```bash
git checkout -- lib/disputes/suggested-credit-api.ts
git checkout -- components/filter-pills.tsx
rm -f .cursor/rules/suggested-credit-api-v2.mdc
npx prisma db seed
npm test
```

**Shipped state again:** suggested credit **$400.00** from v1 on dsp_1043, v2 and stored credit **$249.00**, suite **1 failed / 29 passed**, status pills still writing `state=`.

---

## The 201 track

Open `/runbooks/201`. Four section tabs match the Outline Show headings. Copy a card; Do text and prompts are on the card.

### Why is my agent ignoring my instructions?

Rename two agents, ask each for a Canvas DDD map (whole app vs `@invoice-table.tsx`), then ask across chats:

```text
/ask @Agent 1 All Does refactoring the table change anything across all contexts?
```

Then click the Context Usage indicator below the chat.

### How do I standardize agent behavior?

#### Create-api skill

```text
/create-skill for how to create a new API. Follow the standards in this repo. This is a personal skill named create-api.
```

Open the skill in `~/.cursor/skills`, then promote it:

```text
Promote the create-api skill to this project.
```

Open the project skill in `.cursor/skills`. Skip the room prompt for `/add-dashboard-widget`.

#### Money-formatting hook

Do not create a Cursor rule. Show `.cursor/hooks.json`, `hooks/check-money-formatting.mjs`, and `app/disputes/[id]/page.tsx`. The page stages an unsafe manual formatter in a comment and a `{/* capUsd */}` mark on the Resolution CardDescription. Then:

```text
In app/disputes/[id]/page.tsx, uncomment the local `let capUsd = "$" + (catalogPrice / 100).toFixed(2)` and use capUsd in the Resolution CardDescription. Do not run the money-formatting checker directly. Do not enable Accept or Decline. Keep rendered output and behavior otherwise unchanged.
```

### How does my agent get more information?

Create the private Linear team by hand first ([steps above](#create-the-private-linear-team-manual)): Settings → Teams → New team, **Make team private**, members = you only. Then run `stage-linear-201`.

```text
Add the Linear MCP server to this project.
```

Show Customize → MCPs, then:

```text
Fix Linear issue: Dispute dsp_1043 claims $400 against a $249 Scale invoice
```

Import `plugins/standard-bug-fix` from disk (Customize → Browse Marketplace → Add Marketplace → Import from Disk). Show the standard-bug-fix skill, rule, and Linear MCP. Then:

```text
/standard-bug-fix Overdue / Needs review filter does not change the list
```

### How do I parallelize a task?

#### Refine the plan

```text
@resolve-dispute.md Refine this plan for three parallel worktree agents. Split into exactly: (1) resolve helper (2) resolve API route (3) Resolution panel UI. For each, name owned files, the shared contract, and what I’ll verify when it finishes. Keep the same thin slice. Don’t implement. Don’t touch suggested-credit client/tests, seed, or catalog prices. API must import resolveDispute — do not inline Prisma persist.
```

```text
/multitask @resolve-dispute.md
```

Open diffs, check tests and linters, open [dsp_1043](http://127.0.0.1:43173/disputes/dsp_1043), then Accept or Decline with a reviewer note.

```text
/best-of-n Draft a short product release note for finishing Accept/Decline on dispute resolution in Ledgerly. Audience: internal eng + CE. Include what shipped, how to verify on dsp_1043, and that suggested-credit v1→v2 is out of scope. No code changes. ~150 words.
```

---

## Do not

- Invent a fourth price, ARR, or a real customer
- "Correct" the $400 claim on dsp_1043 or the seed
- Touch `tests/suggested-credit-api.test.ts` to make the migration pass
- Delete or change either suggested-credit API route
- Commit a KPI restyle to `main`
- Treat a green test as a ship decision
