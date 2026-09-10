import type { BrandRunbookExamples } from "@/lib/brand/types";

export function brandRunbookExamples(input: {
  productName: string;
  planExample: string;
  redactExample: string;
  interruptExample: string;
  testRuleExample: string;
  cliAskExample: string;
}): BrandRunbookExamples {
  const { productName } = input;
  return {
    plan: input.planExample,
    "model-fast": "/model.",
    fix: "/plan draft a plan to fix the bug",
    "start-and-stop": input.redactExample,
    "interrupt-steer": input.interruptExample,
    rule: "/create-rule New features should use the new API instead of the legacy API. This is a personal rule.",
    "test-rule": input.testRuleExample,
    skill:
      "/create-skill Use domain-driven design to break down the domains in this application and match it to available APIs or data schemas. This is a personal skill.",
    "test-skill": "Use domain-driven design on this application. Do not edit files.",
    mcp: "Create three slides in Figma Slides outlining how I used Cursor to develop a new feature. I want to use this as part of my demo showcase.",
    orient: `What are ${productName}'s only plan prices, and which seeded invoices are overdue? Cite lib/plans.ts, prisma/seed.ts, and prisma/extra-accounts.ts.\n\nExplain the dispute flow end to end. What is intentionally unfinished? Cite the resolve helper, the resolve API route, and the dispute page. Do not edit any files.`,
    customize: `Open .cursor/rules/ledgerly.mdc, .cursor/skills/choose-cursor-workflow/SKILL.md, and .cursor/agents/api-instrumenter.md. Explain how rules, skills, and subagents differ in this repo. Do not edit them.`,
    models: `Look at the models available in this Cursor session. Recommend a high-reasoning model for the ${productName} /multitask parent and a faster focused model for each api-instrumenter worker. Name the exact picker labels available today, explain where to set them, and do not edit files.`,
    cloud: `Use the hand-to-cloud-agent skill. Explain how to hand this ${productName} repo to a Cloud Agent. Cite .cursor/environment.json (install, seed, port 43173). Draft the exact objective you would send: /autopilot if there is an open PR, otherwise a bounded /goal or /orchestrate that switches the suggested-credit client from v1 to v2, preserves both routes, finishes dispute resolution, and gets npm test green. Do not launch a Cloud Agent unless I confirm the environment is ready. Do not invent a fourth price.`,
    automations: `/automate Create a PR-triggered Cursor Automation that reviews ${productName} guardrails and leaves an evidence-backed comment. Review only; do not modify code, tests, seed, or CI. Use the automate skill. Draft only — do not save or enable the automation. Do not add a GitHub Actions file. If the Automations editor is not available, say so and stop.`,
    "cli-ask": input.cliAskExample,
  };
}
