---
name: dispatch-subagents
description: Launches isolated Task subagents in one parallel turn for independent Ledgerly work. Use for /multitask, when the user asks to run workers at the same time, or when naming api-instrumenter or ledgerly-reviewer.
---

# Dispatch subagents

Hands over **breadth**. Independent pieces run at once; dependent steps stay in order. Each subagent starts with clean context and cannot see the prior chat.

## When to use

- The request has two or more pieces that do not depend on each other's diffs.
- The user said `/multitask`, "in parallel", or named `api-instrumenter`.

Do **not** queue four jobs in one agent. Do **not** start a sibling after another sibling "so it has context" — the dispatch prompt carries everything.

## How to launch

1. Find what is independent. Dependent work waits.
2. In **one** turn, launch one Task subagent per piece. For route instrumentation, use `api-instrumenter` and name **one** route in that prompt.
3. Each dispatch prompt includes: the files, the shared helper path, the constraint (no prices, no seed, no suggested-credit client, no `tests/suggested-credit-api.test.ts`), and how to verify that piece.
4. After the diffs land, launch `ledgerly-reviewer` on the combined diff.
5. Tell the user there is one review per task.

## Constraints

- No sibling cross-talk. A planner or parent only sees its own children.
- Five subagents cost roughly five times one agent. Launch only what is independent.
- You still review. Do not merge or commit unless asked.
