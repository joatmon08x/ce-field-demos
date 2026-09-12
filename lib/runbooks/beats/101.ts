import type { DemoSection } from "@/lib/runbooks/types";

export const RUNBOOK_SECTIONS_101 = [
  {
    id: "first-prompt",
    title: "What is Cursor?",
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
        example:
          "/plan I want a new feature to update the customer email in the invoice detail customer card. Don’t implement email validation.",
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
        example: "/model.",
      },
      {
        id: "fix",
        title: "Plan to fix the bug",
        promptType: "adaptable",
        detail: "Use shift-tab to toggle between modes.",
        example: "/plan draft a plan to fix the bug",
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
          "Let’s change how our agent asks for approvals by configuring an allowlist - a known set of commands that Cursor can run without asking for review. Go to Settings -> Agents -> Executions & Approvals -> Run Mode -> Allowlist.",
      },
      {
        id: "start-and-stop",
        title: "Redact (partial)",
        promptType: "adaptable",
        detail: "",
        example:
          "Redact the customer email in the UI. The first two characters and domain are plaintext.",
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
        example:
          "Redact the customer email in the UI. Show it in plaintext if I click an icon. Stop every time you change a file for me to review.",
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
          "Let’s create a user rule so the agent doesn’t do it again. Go to Customize -> Rules to view the rule.",
        example:
          "/create-rule New features should use the new API instead of the legacy API. This is a personal rule.",
      },
      {
        id: "test-rule",
        title: "Test the rule",
        promptType: "adaptable",
        detail: "",
        example:
          "Add a new feature to show the current cap for dispute credit. Make clear which API you’re referencing.",
      },
      {
        id: "skill",
        title: "Create a user skill",
        promptType: "adaptable",
        detail:
          "Let’s create a user skill that tells me the domain breakdown and available APIs. Go to Customize -> Skills to view the rule.",
        example:
          "/create-skill Use domain-driven design to break down the domains in this application and match it to available APIs or data schemas. This is a personal skill.",
      },
      {
        id: "test-skill",
        title: "Test the skill",
        promptType: "adaptable",
        detail: "",
        example: "Use domain-driven design on this application. Do not edit files.",
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
        example:
          "Create three slides in Figma Slides outlining how I used Cursor to develop a new feature. I want to use this as part of my demo showcase.",
      },
    ],
  },
] as const satisfies readonly DemoSection[];
