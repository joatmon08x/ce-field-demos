import type { RunbookMeta } from "@/lib/runbooks/types";

export const RUNBOOKS: RunbookMeta[] = [
  {
    slug: "multitask",
    command: "/multitask",
    title: "Hands over breadth",
    handsOver: "breadth",
    when: "Many independent pieces of one request.",
    blurb:
      "Four API surfaces, four workers, one finish line. Independent steps run at once; you review one diff per task.",
    tracks: ["201", "advanced"],
    demoPrompt:
      "/multitask Read the multitask entry in RUNBOOKS from lib/runbooks/meta.ts and run its prompt exactly.",
    prompt: `/multitask Add the same small request-log helper to Ledgerly's four independent API surfaces: invoices, disputes, Nudge, and Pulse.

Use the dispatch-subagents skill. Launch four api-instrumenter subagents in one parallel turn — one route each:
- app/api/invoices/route.ts and app/api/invoices/[id]/route.ts
- app/api/disputes/route.ts and app/api/disputes/[id]/route.ts
- app/api/mock/nudge/route.ts
- app/api/mock/pulse/route.ts

A shared helper may live under lib/. Each worker starts with clean context; the dispatch prompt must name the files, the helper, and the constraint. After the diffs land, launch the ledgerly-reviewer subagent. Do not touch prices, prisma/seed.ts, prisma/extra-accounts.ts, lib/disputes/suggested-credit-api.ts, or tests/suggested-credit-api.test.ts. I will review one diff per task.`,
  },
  {
    slug: "loop",
    command: "/loop",
    title: "Hands over time",
    handsOver: "time",
    when: "You would otherwise sit and watch a job finish.",
    blurb:
      "Start the local invoice backfill, then let the agent check it on a schedule until it completes — or until you stop the loop.",
    tracks: ["201", "advanced"],
    setup:
      "Dev server on 43173 (`npm run dev`). The invoice backfill is idle → running → complete over about 45 seconds.",
    demoPrompt:
      "/loop Read the loop entry in RUNBOOKS from lib/runbooks/meta.ts and run its prompt exactly.",
    prompt: `/loop 10s Start the invoice backfill if it is idle (POST http://127.0.0.1:43173/api/demo/job), then GET that URL until status is complete, or until I stop the loop.

Do not add GitHub Actions. Do not write to the Ledgerly database. I still review the result.`,
  },
  {
    slug: "autopilot",
    command: "/autopilot",
    title: "Hands over the pull request",
    handsOver: "the pull request",
    when: "An open pull request must become merge-ready.",
    blurb:
      "Current name for the deck's /babysit workflow. It triages comments, resolves clear conflicts, and fixes scoped CI failures. You still merge.",
    tracks: ["201", "advanced"],
    setup:
      "Prepare an open pull request for the current feature branch with one actionable review comment or a scoped failing check.",
    demoPrompt:
      "/autopilot Read the autopilot entry in RUNBOOKS from lib/runbooks/meta.ts and run its prompt exactly.",
    prompt: `/autopilot Keep the pull request for the current branch merge-ready.

If this branch has no open pull request, stop and say so. Do not open a PR or merge.

Refresh the live PR state before every pass. Work in this order: merge conflicts, active unresolved review comments (including Bugbot), then failing required checks. Validate each finding before acting. Fix only issues caused by this PR and keep every change inside its scope.

Never change CI checks, workflows, the Ledgerly catalog, prisma/seed.ts, prisma/extra-accounts.ts, or tests/suggested-credit-api.test.ts to get green. Preserve both suggested-credit API routes. Stop and ask if branch intent is ambiguous or a billing, security, privacy, migration, or concurrency comment needs judgment. Report ready only when the PR is mergeable, required checks are green, and every active comment is triaged. Do not merge or enable auto-merge; I still review and merge.`,
  },
  {
    slug: "goal",
    command: "/goal",
    title: "Hands over the objective",
    handsOver: "the objective",
    when: "One objective with a clear finish, and you are still steering.",
    blurb:
      "Pin dispute resolution as one long-lived objective. The agent keeps going across turns until the checks pass. You review the result.",
    tracks: ["advanced"],
    demoPrompt:
      "/goal Read the goal entry in RUNBOOKS from lib/runbooks/meta.ts and run its prompt exactly.",
    prompt: `/goal Make Ledgerly demo-complete for dispute resolution.

1. Diagnose why the dispute page still uses the deprecated suggested-credit API, then switch lib/disputes/suggested-credit-api.ts from v1 to v2. Preserve both routes.
2. Implement resolveDispute in lib/disputes/resolve.ts.
3. Make POST /api/disputes/[id]/resolve persist ACCEPTED or DECLINED with the reviewer note.
4. Enable the Accept credit / Decline buttons on app/disputes/[id]/page.tsx.
5. Keep going across turns until npm test is fully green and http://127.0.0.1:43173/disputes/dsp_1043 shows suggested credit at or below the Scale catalog price of $249.

Do not change either suggested-credit route, prisma/seed.ts, prisma/extra-accounts.ts, or tests/suggested-credit-api.test.ts. Preserve the $400 claim. Do not invent a fourth price. When the checks pass, launch the dispute-verifier subagent to report evidence. I still review the result.`,
  },
  {
    slug: "orchestrate",
    command: "/orchestrate",
    title: "Hands over the plan itself",
    handsOver: "the plan itself",
    when: "One objective that first needs its own plan, staffed across agents.",
    blurb:
      "A root planner decomposes dispute resolution and staffs isolated workers. Verifiers check the work. This one is a plugin.",
    tracks: ["201", "advanced"],
    setup: "Install the /orchestrate plugin; put bun on PATH and provide a CURSOR_API_KEY.",
    demoPrompt:
      "/orchestrate Read the orchestrate entry in RUNBOOKS from lib/runbooks/meta.ts and run its prompt exactly.",
    prompt: `/orchestrate Make Ledgerly demo-complete for dispute resolution. This is a plugin workflow — you need bun on PATH and a CURSOR_API_KEY (personal key or team service account, not a team admin key). Slack is optional.

Decompose the work. The root planner writes no code. Workers are isolated; every handoff points up. Staff at least:

- Worker: diagnose the deprecated suggested-credit client selection and switch lib/disputes/suggested-credit-api.ts from v1 to v2. Preserve both routes; do not touch tests/suggested-credit-api.test.ts or the seed.
- Worker: implement resolveDispute and POST /api/disputes/[id]/resolve.
- Worker: enable Accept / Decline on app/disputes/[id]/page.tsx.

Launch the dispute-verifier subagent as the verifier: it checks tests/suggested-credit-api.test.ts (or npm test), confirms both suggested-credit routes still work, POSTs accept/decline against dsp_1043, and loads http://127.0.0.1:43173/disputes/dsp_1043. Republish a task if a verifier fails. I still review and merge. Do not invent a fourth price.`,
  },
];

export function getRunbook(slug: string): RunbookMeta | undefined {
  return RUNBOOKS.find((runbook) => runbook.slug === slug);
}
