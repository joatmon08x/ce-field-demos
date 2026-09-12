# Ledgerly demo howto

Presenter run-of-show for the **101** track, not a course. Every step stands on its own, so you can start anywhere. You still review each result before it ships.

Ledgerly is a small, fictional demo app. It exists to give Cursor enablement steps a visible surface: code to read, a UI to inspect, a scoped error to fix, and tests to verify. The data is synthetic. Avery Quinn is the operator, the only plan prices are Starter **$49**, Growth **$99**, and Scale **$249**, and the clock is frozen at **23 August 2026** so every run is repeatable.

The pastes below match the copy-paste blocks on `/runbooks/101`. Each beat is independent; jump directly to any step.

## Jump menu

The 101 track has three sections. Open `/runbooks/101` and copy a card for any beat.

1. **What is Cursor?** — [Ask](#ask), [Plan](#plan), [Build in Agent mode](#build-in-agent-mode), [Debug](#debug), model choice
2. **How do I work with an agent?** — allowlist, redact, stop, interrupt and steer, review diffs
3. **How do I govern my agent?** — [create a rule](#create-a-rule), create a skill, [Canvas](#canvas), [MCP / Figma](#mcp--figma)

---

## How to narrate

For a novice audience, narrate each step in this order:

- **Before:** "Here is the task and the boundary I am giving Cursor."
- **During:** "Cursor is reading, editing, or checking. I can inspect each action."
- **After:** "Here is the evidence. I decide whether the result ships."

Then add the engineering point: why the task is hard, what Cursor takes on, and why the evidence matters. Do not read prompts aloud. State the intent, paste from the card, then narrate what changed in plain language.

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

- `npm test` is **1 failed / 31 passed**; the sole failure is `tests/suggested-credit-api.test.ts`
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

## The demo error (2 min)

**Open:** [dsp_1043](http://127.0.0.1:43173/disputes/dsp_1043). The dashboard and Collections page are optional context.

**Do:** Point at **Suggested credit $400.00**, then **Scale catalog price $249.00**.

**Why:** One concrete error keeps the demo easy to follow. **Benefit:** Every enablement step can use the same visible example. **Why it matters:** The audience can focus on how Cursor works instead of learning a product.

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

**Look for:** Red **Suggested credit $400.00**, copy stating it came from v1 and is above **$249.00**, and disabled Accept / Decline buttons. Those buttons are a separate unfinished seam; do not confuse them with the API-version error.

---

## Ask

**Open:** Cursor chat in **Ask** mode. Leave the app on the dashboard or the dispute.

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

**Why:** Cursor can drive external tools through MCP. **Benefit:** Generate slides for a showcase without leaving the editor.

Enable a Figma MCP server: **Customize > MCP > Figma**, then:

```text
Create three slides in Figma Slides outlining how I used Cursor to develop a new feature. I want to use this as part of my demo showcase.
```

---

## Verify

**Paste:**

```text
Run npm test and report which tests passed and which failed. Do not edit any files.

On a clean tree, npm test is 1 failed / 31 passed. The sole red test is tests/suggested-credit-api.test.ts because the client intentionally selects deprecated v1. Do not change the test, either route, or the seed.
```

**If the client migration ran:** `tests/suggested-credit-api.test.ts` should be green and dsp_1043 should show **$249** from v2, with both routes intact.

**If no migration ran:** `npm test` should remain **1 failed / 31 passed**. That is shipped state, not failed setup.

**Land:** A green check is evidence, not permission to merge. The presenter remains accountable.

---

## Close

**Say:**

> I reviewed the result. Now I am resetting the demo app so the next session starts with the same planted v1 client, the same $400 UI result, and the same expected red test.

**Do:** Ask the agent to run `reset-demo-state`, or:

```bash
git checkout -- lib/disputes/suggested-credit-api.ts
rm -f .cursor/rules/suggested-credit-api-v2.mdc
npx prisma db seed
npm test
```

**Shipped state again:** suggested credit **$400.00** from v1 on dsp_1043, v2 and stored credit **$249.00**, suite **1 failed / 31 passed**.

---

## Do not

- Invent a fourth price, ARR, or a real customer
- "Correct" the $400 claim on dsp_1043 or the seed
- Touch `tests/suggested-credit-api.test.ts` to make the migration pass
- Delete or change either suggested-credit API route
- Commit a KPI restyle to `main`
- Treat a green test as a ship decision
