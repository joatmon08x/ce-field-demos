import type { DemoSection } from "@/lib/runbooks/types";

export const RUNBOOK_SECTIONS_201 = [
  {
    id: "getting-oriented",
    title: "Getting oriented",
    beats: [
      {
        id: "orient",
        title: "Ask about the application",
        detail: "Trace prices, overdue invoices, and the intentionally unfinished dispute path.",
        example:
          "What are Ledgerly's only plan prices, and which seeded invoices are overdue? Cite lib/plans.ts, prisma/seed.ts, and prisma/extra-accounts.ts.\n\nExplain the dispute flow end to end. What is intentionally unfinished? Cite the resolve helper, the resolve API route, and the dispute page. Do not edit any files.",
      },
    ],
  },
  {
    id: "customize-agent",
    title: "Customize the Agent",
    beats: [
      {
        id: "customize",
        title: "Rules, skills, and subagents",
        detail: "Open the Ledgerly rule, track-picker skill, and one focused worker.",
        example:
          "Open .cursor/rules/ledgerly.mdc, .cursor/skills/choose-cursor-workflow/SKILL.md, and .cursor/agents/api-instrumenter.md. Explain how rules, skills, and subagents differ in this repo. Do not edit them.",
      },
    ],
  },
  {
    id: "model-selection",
    title: "Model selection",
    beats: [
      {
        id: "models",
        title: "Match the model to the task",
        detail:
          "Use a high-reasoning parent to plan and coordinate, then focused workers for one route each.",
        example:
          "Look at the models available in this Cursor session. Recommend a high-reasoning model for the Ledgerly /multitask parent and a faster focused model for each api-instrumenter worker. Name the exact picker labels available today, explain where to set them, and do not edit files.",
      },
    ],
  },
  {
    id: "cloud-agents",
    title: "Cloud Agents",
    beats: [
      {
        id: "cloud",
        title: "Draft a Cloud Agent handoff",
        detail: "Use the checked-in environment and draft only until the environment is confirmed.",
        example:
          "Use the hand-to-cloud-agent skill. Explain how to hand this Ledgerly repo to a Cloud Agent. Cite .cursor/environment.json (install, seed, port 43173). Draft the exact objective you would send: /autopilot if there is an open PR, otherwise a bounded /goal or /orchestrate that switches the suggested-credit client from v1 to v2, preserves both routes, finishes dispute resolution, and gets npm test green. Do not launch a Cloud Agent unless I confirm the environment is ready. Do not invent a fourth price.",
      },
    ],
  },
  {
    id: "automations",
    title: "Automations",
    beats: [
      {
        id: "automations",
        title: "Draft a governed automation",
        detail: "Open the Automations editor with a reviewed draft. Do not save or enable it.",
        example:
          "/automate Create a PR-triggered Cursor Automation that reviews Ledgerly guardrails and leaves an evidence-backed comment. Review only; do not modify code, tests, seed, or CI. Use the automate skill. Draft only — do not save or enable the automation. Do not add a GitHub Actions file. If the Automations editor is not available, say so and stop.",
      },
    ],
  },
  {
    id: "trust-and-verification",
    title: "Trust and verification",
    beats: [
      {
        id: "trust",
        title: "Verify before shipping",
        detail:
          "Run the shipped suite and distinguish the expected suggested-credit failure from regressions.",
        example:
          "Run npm test and report which tests passed and which failed. Do not edit any files.\n\nOn a clean tree, npm test is 1 failed / 20 passed. The red test is tests/suggested-credit-api.test.ts. Do not change it, the suggested-credit client, either versioned route, or the seed.",
      },
    ],
  },
] as const satisfies readonly DemoSection[];
