---
name: choose-cursor-workflow
description: Walk the 101 or 201 Ledgerly track, then choose the mode, model, rule, or skill that fits the shape of the work. You still review the result.
---

# Walk the 101 or 201 track

The demo ships two jumpable tracks: **101** and **201**. Every beat is independent — if the user names a beat, jump directly to it. You still review the result.

## The tracks

101 — You will explore different ways to work in Grok Build, use modes and models for the right tasks, apply rules and skills to ensure consistent quality, and complete at least one task with an agent.

201 — You will curate what belongs in an agent's context, encode conventions as project skills and hooks, connect a curated set of MCP servers, and split one task across parallel agents.

The beats live in `lib/runbooks/meta.ts` and as copy-paste blocks on `/runbooks/101` and `/runbooks/201`. Use the matching `example` verbatim. Do not invent another catalog price.

The named demo error is `dsp_1043` / the suggested-credit v1 client. Do not mention the invoice or dispute filter-pill `state=` seam unless the user is on that click path.

## 101 sections and beats

1. **What is Grok Build?** — Ask, Plan, Build in Agent mode, Debug, change to a fast model, plan to fix the bug.
2. **How do I work with an agent?** — Run Mode allowlist, redact, stop, interrupt and steer, review diffs, restore from a checkpoint.
3. **How do I govern my agent?** — create a user rule, test the rule, create a user skill, test the skill, Canvas, MCP / Figma.

## 201 sections and beats

1. **Why is my agent ignoring my instructions?** — rename agents, Ask DDD, compare agents, ask across chats, check context usage.
2. **How do I standardize agent behavior?** — personal create-api skill, promote it, money-format hook and script, bypass-formatter test.
3. **How does my agent get more information?** — Linear MCP, MCP allowlist, Ask Linear for the filter bug, marketplace plugin (`plugins/standard-bug-fix`, CompanyTicket MCP), `/standard-bug-fix` on the filter-pills issue. The operator creates a private Linear team in the UI first (Settings → Teams → New team, Make team private). Then run `stage-linear-201`. `.cursor/mcp.json` has no project servers and there is no `mcp/` directory. Do not stand up a SQLite MCP.
4. **How do I parallelize a task?** — resolve-dispute plan, ledgerly-reviewer, dispatch-subagents skill, `/multitask`, ledgerly-reviewer check.

## Choose the mode

- **Ask** reads and explains; it does not edit. Use it to orient before touching code.
- **Plan** maps an approach before implementation.
- **Agent** is the default; it inspects, edits, and runs checks within the boundary you give it.
- **Debug** verifies a change and investigates failures.

## Choose the model

Use a high-reasoning model to plan and coordinate, and a faster model for narrow, well-scoped edits. On Teams and Enterprise, Auto (Cursor Router) classifies each request for you. Pin a model when the role is already known.

## What does not change

The human reviews the result and decides what ships. Modes and models change how the work runs, not who is accountable.
