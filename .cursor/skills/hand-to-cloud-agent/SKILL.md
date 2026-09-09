---
name: hand-to-cloud-agent
description: Hands Ledgerly work to Cloud Agents. Use for durable /goal runs, /autopilot PR supervision, or /orchestrate planner/worker/verifier trees. Not for a local /loop.
---

# Hand work to a Cloud Agent

Local `/loop` lives inside this session and dies when the laptop closes. A Cloud Agent can hold a `/goal`, supervise a PR with `/autopilot`, or staff an `/orchestrate` tree.

## When to use

- `/goal` and the finish line will take longer than this sitting, or must continue after the laptop closes.
- `/autopilot` — an open PR needs event-driven passes over conflicts, comments, and checks.
- `/orchestrate` — a root planner decomposes the work; workers are isolated; verifiers check the result.

## /goal in the cloud

Use the `/goal` prompt from `lib/runbooks/meta.ts` verbatim. Scope the finish line so it is verifiable: the client selects v2, both routes remain, `npm test` is green, `dsp_1043` shows $249, and dispute resolution works. The agent judges when the objective is met; you review.

## /autopilot

The 201 deck calls this `/babysit`; the current built-in skill is `/autopilot`. It needs a real open PR. Refresh live PR state each pass, handle conflicts before comments before CI, stop on ambiguous intent, and leave the merge decision to the human.

## /orchestrate

This one is a **plugin**, not built in. Before running it:

- `bun` on PATH
- `CURSOR_API_KEY` — a personal key or a team service account, not a team admin key
- Slack is optional and mirrors the run in a thread

The root planner writes no code. Workers are isolated; every handoff points up. Split the v1-to-v2 client migration from the dispute-resolution stub work. Name `dispute-verifier` as the verifier. Republish a task if a verifier fails.

## What you keep

You review and merge. Do not treat a green verifier or merge-ready PR as a ship decision. Do not use this skill for a local `/loop` on `/api/demo/job`.
