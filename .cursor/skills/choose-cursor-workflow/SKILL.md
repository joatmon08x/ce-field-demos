---
name: choose-cursor-workflow
description: Picks the 101, 201, or Advanced Ledgerly track, then chooses /multitask, /loop, /autopilot, /goal, or /orchestrate from the shape of the work.
---

# Choose a demo track and workflow

The workflows are not interchangeable. Pick on the shape of the work: how many pieces, and what tells you it is done. You still review the result.

## Pick a track

- **101** — You will explore different ways to work in Cursor, use modes and models for the right tasks, apply rules and skills to ensure consistent quality, and complete at least one task with an agent.
- **201** — orient, migrate the v1 client to v2, create the v2-only rule live, then cover customization, models, Cloud Agents, Automations, trust, and one of `/multitask`, `/loop`, `/autopilot`, or `/orchestrate`.
- **Advanced** — deeper Ledgerly scenarios. Starts with the Cursor CLI primer, then adds `/goal` for a durable product objective.

Every beat is independent. If the user names a command, jump directly to it.

## Choose the command

1. **Many independent pieces?**
   - Yes → `/multitask` — hands over **breadth**.
2. **Just waiting or re-checking?**
   - Yes → `/loop` — hands over **time**.
3. **An open PR must become merge-ready?**
   - Yes → `/autopilot` — hands over **the pull request**. This is the current name for the deck's `/babysit`.
4. **One long-lived objective with a clear finish?**
   - Yes → `/goal` — hands over **the objective**. Advanced track only.
5. **The objective must first be decomposed and staffed?**
   - Yes → `/orchestrate` — hands over **the plan itself**.

Rule of thumb: use `/autopilot` only when there is a real pull request — if there is none, stop and say so. Use `/goal` for a durable objective that is not merely PR supervision. Use `/orchestrate` when the plan itself must be delegated. `/loop` must start with `/loop` so the slash command fires.

## What does not change

The human reviews the result and decides what ships. These commands change how much runs without sitting there, not who is accountable.

## Use the matching prompt

Prompts live in `lib/runbooks/meta.ts` and as copy-paste blocks on `/runbooks`. Use the matching `prompt` verbatim. Do not invent another catalog price.

| Command | Ledgerly target |
| --- | --- |
| `/multitask` | Four API surfaces via `dispatch-subagents` + `api-instrumenter` |
| `/loop` | `POST` then poll `/api/demo/job` |
| `/autopilot` | Current branch's open PR until merge-ready; the human merges |
| `/goal` | Migrate the suggested-credit client to v2 and finish dispute resolution |
| `/orchestrate` | Same outcome, split across planner/workers/`dispute-verifier` (plugin + `CURSOR_API_KEY`) |
