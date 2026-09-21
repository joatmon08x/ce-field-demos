import type { DemoSection } from "@/lib/runbooks/types";

export const RUNBOOK_SECTIONS_201 = [
  {
    id: "target-context",
    title: "What is the agent doing to manage context?",
    beats: [
      {
        id: "rename-agent-1-all",
        title: "Rename Agent 1 All",
        promptType: "reusable",
        detail: "Open one agent and ask it for information about the entire codebase.",
        example: "/rename-chat Agent 1 All",
      },
      {
        id: "ask-ddd-all",
        title: "Ask DDD of the application",
        promptType: "reusable",
        detail: "Ask the all-codebase agent for domain-driven design.",
        example: "/ask what is the domain driven design of the application.",
      },
      {
        id: "rename-agent-2-target",
        title: "Rename Agent 2 Target",
        promptType: "reusable",
        detail: "Open a second agent for a new targeted context window.",
        example: "/rename-chat Agent 2 Target",
      },
      {
        id: "ask-ddd-invoice-table",
        title: "Ask DDD of the invoice table",
        promptType: "reusable",
        detail: "Ask for domain-driven design of the invoice table only.",
        example: "/ask what is the domain driven design of the @invoice-table.tsx",
      },
      {
        id: "context-usage",
        title: "Check context usage",
        promptType: "none",
        detail:
          "Go to Agent 1 All chat. Select the Context Usage indicator below the chat. Go to Agent 2 Target. Select the Context Usage indicator below the chat.",
      },
      {
        id: "compare-agents",
        title: "Compare agents",
        promptType: "none",
        detail:
          "Agent 1 maps all the domains in the whole codebase. Agent 2 maps half of the domains based on the targeted context.",
      },
      {
        id: "ask-cross-context",
        title: "Ask across agents",
        promptType: "reusable",
        detail:
          "Agent 1 mapped all domains; Agent 2 can reuse that summary. Go to Agent 2 Target chat.",
        example: "/ask @Agent 1 All Does refactoring the table change anything across all contexts?",
      },
    ],
  },
  {
    id: "standardize-behavior",
    title: "How do I standardize agent behavior?",
    beats: [
      {
        id: "create-api-personal-skill",
        title: "Create personal create-api skill",
        promptType: "reusable",
        detail:
          "Open a new agent. It scans the entire repository for the pattern. Create a personal skill for how to create a new API. Open skill in ~/.cursor/skills.",
        example:
          "/create-skill for how to create a new API. Follow the standards in this repo. This is a personal skill named create-api.",
      },
      {
        id: "promote-create-api-project",
        title: "Promote create-api to project",
        promptType: "reusable",
        detail:
          "Promote the create-api skill so teammates can use it. Open skill in .cursor/skills. Explore the other project skills for this repository, such as add-dashboard-widget, draft-collection-email, or write-prisma-query.",
        example: "Promote the create-api skill to this project.",
      },
    ],
  },
  {
    id: "mcp-more-info",
    title: "How does my agent get more information?",
    beats: [
      {
        id: "add-linear-mcp",
        title: "Enable Linear MCP",
        promptType: "none",
        detail:
          "Let’s start the issue tracker’s MCP server (in this case, Linear) to get a ticket to this project. Review MCP servers in Customize -> MCPs. Enable the Linear MCP server.",
      },
      {
        id: "mcp-allowlist",
        title: "Check MCP allowlist",
        promptType: "none",
        detail:
          "Go to Settings -> Agents -> Execution and Approvals -> Allowlist Options -> MCP Allowlist to check valid MCP servers and tools from your administrator.",
      },
      {
        id: "ask-linear-bug",
        title: "List open issues",
        promptType: "adaptable",
        detail:
          "Open a new agent. Someone reported a bug and it was logged in our issue tracker. I want more information on it. Explore the tool calls to Linear MCP server.",
        example: "List the open issues from our issue tracker.",
      },
      {
        id: "add-local-plugin",
        title: "Add plugin",
        promptType: "none",
        detail:
          "A teammate created a plugin for standardizing bug fixes. Go to Customize -> Plugins -> Add -> From Local Repository. Find the plugins/standard-bug-fix file directory and add it.",
      },
      {
        id: "check-plugin",
        title: "Enable Standard bug fix plugin",
        promptType: "none",
        detail:
          "Go to Customize -> Plugins. Go to Personal. Select Add to enable the “Standard bug fix” plugin. Show that the plugin has skills, rules, and MCP server.",
      },
      {
        id: "standard-bug-fix",
        title: "Standard bug fix",
        promptType: "adaptable",
        detail:
          "Let’s fix the bug and update the issue with the standard template. Go to the issue in Linear and review the comments following the bug template.",
        example: "Work on a standard bug fix for the issue where clicking overdue does not filter.",
      },
    ],
  },
  {
    id: "parallelize-task",
    title: "How do I parallelize a task?",
    beats: [
      {
        id: "open-new-agent",
        title: "Open a new agent",
        promptType: "none",
        detail: "Open a new agent.",
      },
      {
        id: "open-resolve-dispute-plan",
        title: "Open resolve-dispute plan",
        promptType: "none",
        detail:
          "Open .cursor/plans/resolve-dispute.md. Review the plan and how it splits data, API, and UI tasks.",
      },
      {
        id: "open-ledgerly-reviewer",
        title: "Open ledgerly-reviewer",
        promptType: "none",
        detail: "Open .cursor/agents/ledgerly-reviewer.md",
      },
      {
        id: "open-dispatch-subagents-skill",
        title: "Open dispatch-subagents skill",
        promptType: "none",
        detail: "Open .cursor/skills/dispatch-subagents/SKILL.md.",
      },
      {
        id: "multitask-resolve-dispute",
        title: "Multitask resolve-dispute",
        promptType: "reusable",
        detail: "Build the feature using the /multitask command.",
        example: "/multitask @resolve-dispute.md",
      },
      {
        id: "canvas-subagent-progress",
        title: "Canvas subagent progress",
        promptType: "adaptable",
        detail:
          "Use Canvas to keep track of the progress of subagents and their tasks. Review Canvas with subagent progress and worktree conflicts.",
        example:
          "Update Canvas with subagent progress and models used. Make a list of worktree conflicts as you encounter them.",
      },
      {
        id: "ledgerly-reviewer-check",
        title: "ledgerly-reviewer check",
        promptType: "adaptable",
        detail: "Use the specialized reviewer subagent to check the completed task.",
        example: "ledgerly-reviewer check my work",
      },
    ],
  },
] as const satisfies readonly DemoSection[];
