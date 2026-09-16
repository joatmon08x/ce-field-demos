# Finish dispute resolution — three parallel agents

Canonical artifacts: `openspec/changes/resolve-dispute/` (proposal, design, tasks, one delta spec per worker). This file is the 201 `/multitask` shim so Desktop can keep `/multitask @resolve-dispute.md` without changing runbook beats.

## Dispatch

Chat prompt:

```
/multitask @resolve-dispute.md
```

Use `.cursor/skills/dispatch-subagents/SKILL.md`. **Exactly three** parallel worktrees — one isolated Task worker per OpenSpec capability below. Do **not** implement in the parent chat. Do **not** fan out a fourth agent to write tests. Each worker starts with a clean context — put owned files, `openspec/changes/resolve-dispute/design.md` (shared contract), the matching delta spec, constraints, and how to verify **in that worker’s prompt**. Do not start a sibling after another sibling “so it has context.”

| Worker | Delta spec | Owns |
| --- | --- | --- |
| 1 | `openspec/changes/resolve-dispute/specs/dispute-resolution-helper/spec.md` | `lib/disputes/resolve.ts` only |
| 2 | `openspec/changes/resolve-dispute/specs/dispute-resolution-api/spec.md` | `app/api/disputes/[id]/resolve/route.ts` only |
| 3 | `openspec/changes/resolve-dispute/specs/dispute-resolution-ui/spec.md` | `app/disputes/[id]/page.tsx` + optional `components/disputes/resolution-panel.tsx` |

The three files in `.cursor/agents/` are **not** the three implementers. Map them by role: implementers = isolated Task workers; `api-instrumenter` is out of this slice; `ledgerly-reviewer` after the three diffs; `dispute-verifier` after apply against port 43173.

Apply order: helper → API → UI. Then sequential e2e (parent only). Then reviewer, then verifier. Human merges.

End-to-end tests are **not** part of `/multitask`. `npm test` stays **1 failed / 29 passed**. Do not migrate suggested-credit v1. Do not invent a catalog price. `dsp_1043` may claim $400; stored credit on accept is **$249**.

Cloud / SDK: `openspec/sdk-kickoff.md`. Single-agent apply: `/opsx-apply resolve-dispute`.
