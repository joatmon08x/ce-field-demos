import type { DemoSection } from "@/lib/runbooks/types";
import { getActiveBrand } from "@/lib/brand";

const examples = getActiveBrand().runbookExamples;

export const RUNBOOK_SECTIONS_101 = [
  {
    id: "first-prompt",
    title: "What is Grok Build?",
    beats: [
      {
        id: "ask",
        title: "Ask",
        promptType: "reusable",
        detail: "Let’s learn more about the application with Ask mode.",
        example: "/ask Tell me what this application does in 3 sentences",
      },
      {
        id: "plan",
        title: "Plan",
        promptType: "adaptable",
        detail: "Map your approach to building a new feature in Plan mode.",
        example: examples.plan,
      },
      {
        id: "agent-build",
        title: "Build in Agent mode",
        promptType: "none",
        detail: "Build the feature in Agent mode. Build the plan locally. Check the feature in the UI.",
      },
      {
        id: "debug",
        title: "Debug",
        promptType: "reusable",
        detail: "Fix the bug using Debug mode.",
        example: "/debug the failing test",
      },
      {
        id: "model-fast",
        title: "Change to a fast model",
        promptType: "adaptable",
        detail: "Change to a fast model for a small update. Change model from Auto to Fast.",
        example: examples["model-fast"],
      },
      {
        id: "fix",
        title: "Plan to fix the bug",
        promptType: "adaptable",
        detail: "Use shift-tab to toggle between modes.",
        example: examples.fix,
      },
    ],
  },
  {
    id: "work-with-agent",
    title: "How do I work with an agent?",
    beats: [
      {
        id: "allowlist",
        title: "Run Mode Allowlist",
        promptType: "none",
        detail:
          "Let’s change how our agent asks for approvals by configuring an allowlist - a known set of commands that Grok Build can run without asking for review. Go to Settings -> Agents -> Executions & Approvals -> Run Mode -> Allowlist.",
      },
      {
        id: "start-and-stop",
        title: "Redact (partial)",
        promptType: "adaptable",
        detail: "",
        example: examples["start-and-stop"],
      },
      {
        id: "stop",
        title: "Stop the prompt",
        promptType: "none",
        detail: "Stop the prompt with the Stop button.",
      },
      {
        id: "interrupt-steer",
        title: "Interrupt and steer",
        promptType: "adaptable",
        detail: "Steer the prompt. Show how the agent pauses for your approval. Continue each file.",
        example: examples["interrupt-steer"],
      },
      {
        id: "diffs",
        title: "Review diffs",
        promptType: "none",
        detail: "Show diffs from agent’s last turn.",
      },
    ],
  },
  {
    id: "govern-agent",
    title: "How do I govern my agent?",
    beats: [
      {
        id: "rule",
        title: "Create a user rule",
        promptType: "adaptable",
        detail:
          "Let’s create a user rule so the agent doesn’t try to improve the invoice schema without our approval. Go to Customize -> Rules to view the rule.",
        example: examples.rule,
      },
      {
        id: "test-rule",
        title: "Test the rule",
        promptType: "adaptable",
        detail: "",
        example: examples["test-rule"],
      },
      {
        id: "skill",
        title: "Create a user skill",
        promptType: "adaptable",
        detail:
          "Let’s create a user skill that tells me the domain breakdown and available APIs. Go to Customize -> Skills to view the skill.",
        example: examples.skill,
      },
      {
        id: "test-skill",
        title: "Test the skill",
        promptType: "adaptable",
        detail: "",
        example: examples["test-skill"],
      },
      {
        id: "canvas",
        title: "Canvas",
        promptType: "reusable",
        detail: "Use Canvas to generate interactive artifacts that render next to the chat.",
        example: "Create a canvas explaining what we did today.",
      },
      {
        id: "mcp",
        title: "MCP / Figma",
        promptType: "adaptable",
        detail:
          "Ask Grok Build to create a slideshow in Figma using MCP Servers. Enable a MCP server for slideshow generation in Grok Build. Go to Customize > MCPs > Figma.",
        example: examples.mcp,
      },
    ],
  },
] as const satisfies readonly DemoSection[];
