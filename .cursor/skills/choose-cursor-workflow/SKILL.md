---
name: choose-cursor-workflow
description: Walk the 101 Ledgerly track, then choose the mode, model, rule, or skill that fits the shape of the work. You still review the result.
---

# Walk the 101 track

The demo ships one jumpable track: **101**. The deeper tracks were removed as not-ready. Every beat is independent — if the user names a beat, jump directly to it. You still review the result.

## The track

101 — You will explore different ways to work in Cursor, use modes and models for the right tasks, apply rules and skills to ensure consistent quality, and complete at least one task with an agent.

The beats live in `lib/runbooks/meta.ts` and as copy-paste blocks on `/runbooks/101`. Use the matching `example` verbatim. Do not invent another catalog price.

## Sections and beats

1. **How do I write my first prompt?** — Ask, Plan, Build in Agent mode, Debug, change to a fast model, plan to fix the bug.
2. **How do I work with an AI agent?** — Run Mode allowlist, change to a deep model, redact, stop, interrupt and steer, review diffs.
3. **How do I govern my agent?** — create a user rule, test the rule, create a user skill, test the skill, Canvas, MCP / Figma.

## Choose the mode

- **Ask** reads and explains; it does not edit. Use it to orient before touching code.
- **Plan** maps an approach before implementation.
- **Agent** is the default; it inspects, edits, and runs checks within the boundary you give it.
- **Debug** verifies a change and investigates failures.

## Choose the model

Use a high-reasoning model to plan and coordinate, and a faster model for narrow, well-scoped edits. On Teams and Enterprise, Auto (Cursor Router) classifies each request for you. Pin a model when the role is already known.

## What does not change

The human reviews the result and decides what ships. Modes and models change how the work runs, not who is accountable.
