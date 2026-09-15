---
name: standard-bug-fix
description: Run a standard Linear bug fix. Use when the user types /standard-bug-fix, names a Linear issue such as LY-003, or asks to fix a ticket and write hypothesis, debug notes, and the fix PR back to Linear.
---

# Standard bug fix

Take one Linear issue from report → hypothesis → debug notes → PR. Keep Linear current. Do not invent a second issue.

## Prerequisites

This plugin ships the Linear MCP server (`https://mcp.linear.app/mcp`). If Linear tools are missing, authenticate that MCP, then continue.

## Input

The user passes an issue id (`LY-003`, a Linear URL, or `/standard-bug-fix LY-003`). Fetch that issue with Linear MCP. Work only that ticket.

## Ledgerly bounds

- Prices only from `lib/plans.ts`: Starter $49, Growth $99, Scale $249.
- Customers and operator from `prisma/seed.ts` and `prisma/extra-accounts.ts`. Emails use `.example`. Operator is Avery Quinn.
- Leave `tests/suggested-credit-api.test.ts` and the v1 suggested-credit client alone unless this ticket is that migration.
- Leave the dispute-resolution stub unfinished unless this ticket is that work.

## Linear comment template

Every Linear writeback uses this shape. Concise. No extra sections.

```markdown
# Bug Fix Summary: [Service affected] - [Short Description]

## 2. The Core Problem (Why it happened)
* **Immediate Trigger:** [e.g., A missing environment variable after deployment.]
* **Underlying Flaw:** [e.g., The deployment script lacked a validation step to ensure keys existed before spinning up containers.]

## 3. Quick Takeaways
* **Good:** Detection was instant; rollback process worked flawlessly.
* **Bad:** Debugging took too long because logs lacked contextual request IDs.

## 4. Fixes
- [ ] **Action:** Add check to deployment script | **Owner:** @name | **PR:** #123
```

## Sequence

1. **Read the issue.** Pull title, description, comments, and assignee from Linear. Reproduce from the repo (tests, seed, running app) — do not treat the ticket text as a license to invent prices or customers.
2. **Hypothesis (Linear comment).** Before product edits, comment with the template. Fill **Service affected**, **Short Description**, and **Core Problem**. Leave Takeaways/Fixes as `TBD` if unknown. State the potential hypothesis in Immediate Trigger and Underlying Flaw.
3. **Debug.** Instrument or inspect only what you need. Note what confirmed or killed the hypothesis.
4. **Debugging notes (Linear comment).** Comment again with the template. Keep Core Problem; fill **Quick Takeaways** (Good / Bad) from the actual debug path.
5. **Fix.** Smallest change that matches the ticket. Verify with the relevant tests (and the UI path if the change is visible).
6. **PR.** Open a pull request for the fix. Do not merge it.
7. **Fix PR (Linear comment).** Comment with the **full** template. Check the Fixes item (`[x]`). **Action** is what shipped. **Owner** is the Linear assignee, or Avery Quinn. **PR** is the PR number or URL. Link the PR on the Linear issue if the MCP can.

Do not skip the three Linear comments. Do not paste secrets, production PII, or real company names into Linear.
