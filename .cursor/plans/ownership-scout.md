# Create the ownership-scout subagent

Chat prompt (any model works for writing this file):

```
Create a project subagent at .cursor/agents/ownership-scout.md, matching the frontmatter style of .cursor/agents/ledgerly-reviewer.md. Do not add a model field.

Name: ownership-scout
Description: Read-only ownership scout for the 301 lab. Use before Collections Command Center work when multiple contributors have open pull requests. Builds an Owns matrix from draft and ready PRs. Writes no product code. Invoke on a higher-reasoning model, not the coordinator's inherited model.

In the agent body, add a line near the top: run ownership-scout on a higher-reasoning model. A parent that launches it as a Task passes a higher-reasoning model explicitly instead of inheriting its own.

When invoked, the agent must:
1. List open pull requests with gh, including drafts. Do not merge any of them.
2. For each PR, take the changed file list (gh pr diff --name-only). That list is the claim. If the PR body has no ## Owns list, create the Owns entry in the local matrix from the changed files, and do not add ## Owns or ## Must not to the PR. If the body already has ## Owns or ## Must not, flag drift: files in the diff that are not in Owns, or Owns paths missing from the diff. Never edit a pull request body.
3. Add Developer C’s planned Collections Command Center paths only if they are not already a PR: lib/collection-note.ts, the collection-note API route, and a collection-note panel. CCC scope is persist the invoice collection note only. No customers book, payments, Nudge log, dashboard KPI, or new Prisma models.
4. Classify overlaps as Hard, Soft, or Clear. A Hard collision is two claims on the same file, especially app/invoices/[id]/page.tsx shared by the email PR and the collection note.
5. Write .cursor/owns-matrix.json (gitignored) with owner, feature, paths, severity, and whether dispatch should stop. Do not edit product code, seed, suggested-credit, or 101/201 runbook beats.
6. If any overlap is Hard, say dispatch is blocked and name the extract (collection-note panel vs email card). Developer A’s resolve draft must stay unmerged. Do not add lab issues to the staged three Fieldnote issues.

Catalog stays Starter $49, Growth $99, Scale $249. Show me the agent file before keeping it.
```

## Goal

Add `.cursor/agents/ownership-scout.md` only. Do not run the scout, open pull requests, or edit product code in this step.

## Constraints

- Match `ledgerly-reviewer` frontmatter (`name`, `description`). No `model` field, so no slug goes stale.
- The higher-reasoning model is pinned when the scout is invoked, not when the file is written. From the picker, choose a higher-reasoning model before running the scout. From a coordinator, launch the scout Task with an explicit higher-reasoning model. Collections Command Center implementers can stay on a faster model.
- Scout writes no product code when later invoked.
- Do not merge Developer A’s resolve draft. That stub stays unfinished for the 201 multitask beat.
- Do not add lab issues to the staged `ce-field-demos` project of three Fieldnote issues.
- Catalog only: Starter $49, Growth $99, Scale $249.
- If a pull request has no ## Owns list, build that claim in `.cursor/owns-matrix.json` from the changed files. Do not write ## Owns or ## Must not onto the pull request.
