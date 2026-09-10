import type { DemoSection } from "@/lib/runbooks/types";
import { getActiveBrand } from "@/lib/brand";

const examples = getActiveBrand().runbookExamples;

export const RUNBOOK_SECTIONS_201 = [
  {
    id: "getting-oriented",
    title: "Getting oriented",
    beats: [
      {
        id: "orient",
        title: "Ask about the application",
        promptType: "adaptable",
        detail: "Trace prices, overdue invoices, and the intentionally unfinished dispute path.",
        example: examples.orient,
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
        promptType: "adaptable",
        detail: "Open the project rule, track-picker skill, and one focused worker.",
        example: examples.customize,
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
        promptType: "adaptable",
        detail:
          "Use a high-reasoning parent to plan and coordinate, then focused workers for one route each.",
        example: examples.models,
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
        promptType: "adaptable",
        detail: "Use the checked-in environment and draft only until the environment is confirmed.",
        example: examples.cloud,
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
        promptType: "adaptable",
        detail: "Open the Automations editor with a reviewed draft. Do not save or enable it.",
        example: examples.automations,
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
        promptType: "reusable",
        detail:
          "Run the shipped suite and distinguish the expected suggested-credit failure from regressions.",
        example:
          "Run npm test and report which tests passed and which failed. Do not edit any files.\n\nOn a clean tree, npm test is 1 failed / 35 passed. The red test is tests/suggested-credit-api.test.ts. Do not change it, the suggested-credit client, either versioned route, or the seed.",
      },
    ],
  },
] as const satisfies readonly DemoSection[];
