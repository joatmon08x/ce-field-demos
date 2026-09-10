import type { DemoSection } from "@/lib/runbooks/types";
import { getActiveBrand } from "@/lib/brand";

const examples = getActiveBrand().runbookExamples;

export const RUNBOOK_SECTIONS_101 = [
  {
    id: "first-prompt",
    title: "How do I write my first prompt?",
    beats: [
      {
        id: "ask",
        title: "Ask",
        promptType: "reusable",
        detail:
          "Let’s ask questions about the application. In Ask mode, the agent understands the files. It is read-only.",
        example: "/ask Tell me what this application does in 3 sentences",
      },
      {
        id: "plan",
        title: "Plan",
        promptType: "adaptable",
        detail: "Let’s plan out the feature. In Plan mode, the agent maps its approach.",
        example: examples.plan,
      },
      {
        id: "agent-build",
        title: "Build in Agent mode",
        promptType: "none",
        detail:
          "Agent mode is the default. It makes the change. Build the plan locally. Check the feature in the UI.",
      },
      {
        id: "debug",
        title: "Debug",
        promptType: "reusable",
        detail:
          "Let’s try to fix it using Debug mode. In Debug mode, you verify the change and investigate and fix any issues.",
        example: "/debug the failing test",
      },
      {
        id: "model-fast",
        title: "Change to a fast model",
        promptType: "adaptable",
        detail: "Let’s change the model to something faster. Change model from Auto to Fast.",
        example: examples["model-fast"],
      },
      {
        id: "fix",
        title: "Plan to fix the bug",
        promptType: "adaptable",
        detail: "Show shift-tab to toggle between modes.",
        example: examples.fix,
      },
    ],
  },
  {
    id: "work-with-agent",
    title: "How do I work with an AI agent?",
    beats: [
      {
        id: "allowlist",
        title: "Run Mode Allowlist",
        promptType: "none",
        detail: "Go to Settings → Agents → Executions & Approvals → Run Mode → Allowlist.",
      },
      {
        id: "model-deep",
        title: "Change to a deep / intelligent model",
        promptType: "reusable",
        detail: "Change model to intelligent model.",
        example: "/model",
      },
      {
        id: "start-and-stop",
        title: "Redact (partial)",
        promptType: "adaptable",
        detail:
          "Update the email feature; security recommended redacting a portion of the customer email.",
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
          "Let’s create a user rule so the agent doesn’t do it again. Show the user rule in the UI and how it can be changed.",
        example: examples.rule,
      },
      {
        id: "test-rule",
        title: "Test the rule",
        promptType: "adaptable",
        detail: "Check the rule is applied.",
        example: examples["test-rule"],
      },
      {
        id: "skill",
        title: "Create a user skill",
        promptType: "adaptable",
        detail:
          "Let’s create a user skill that tells me the domain breakdown and available APIs. Show the user skill in the UI and how it can be changed.",
        example: examples.skill,
      },
      {
        id: "test-skill",
        title: "Test the skill",
        promptType: "adaptable",
        detail: "Use the skill (no file edits).",
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
          "Ask Cursor to create a slideshow in Figma using MCP Servers. Enable a MCP server for slideshow generation in Cursor. Go to Customize > MCP > Figma.",
        example: examples.mcp,
      },
    ],
  },
] as const satisfies readonly DemoSection[];
