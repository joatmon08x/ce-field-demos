import type { DemoSection } from "@/runbooks/types";

export const RUNBOOK_SECTIONS_201 = [
  {
    id: "target-context",
    title: "How do you manage context?",
    beats: [
      {
        id: "rename-agent-1-all",
        title: "Open one agent and ask it for information about the entire codebase.",
        promptType: "reusable",
        detail: "",
        example: "/rename-chat Agent 1 All",
      },
      {
        id: "ask-ddd-all",
        title: "Ask DDD of the application",
        promptType: "reusable",
        detail: "",
        example: "/ask what is the domain driven design of the application.",
      },
      {
        id: "rename-agent-2-target",
        title: "Let’s open a second agent. This starts a new context window.",
        promptType: "reusable",
        detail: "",
        example: "/rename-chat Agent 2 Target",
      },
      {
        id: "ask-ddd-invoice-table",
        title: "Ask DDD of the invoice table",
        promptType: "reusable",
        detail: "",
        example: "/ask what is the domain driven design of the @invoice-table.tsx",
      },
      {
        id: "context-usage",
        title: "Check agent 1’s context window.",
        promptType: "none",
        detail:
          "Go to Agent 1 All chat. Click the Context Usage indicator below the chat. Agent 1 maps all the domains in the whole codebase. Its context window shows X%.",
      },
      {
        id: "compare-agents",
        title: "Check agent 2’s context window.",
        promptType: "none",
        detail:
          "Go to Agent 2 Target. Click the Context Usage indicator below the chat. Agent 2 maps half of the domains based on the targeted context. Its context window shows Y%. The difference in context window may not be significant but can affect larger repositories.",
      },
      {
        id: "ask-cross-context",
        title: "We want to check if the invoice table can be changed in isolation.",
        promptType: "reusable",
        detail:
          "Agent 1 did the work of identifying all domains. Agent 2 can benefit from its summary. It doesn’t need to review the entire codebase again. Go to Agent 2 Target chat.",
        example: "/ask @Agent 1 All Does refactoring the table change anything across all contexts?",
      },
    ],
  },
  {
    id: "standardize-agents",
    title: "How do you standardize agents?",
    beats: [
      {
        id: "create-api-personal-skill",
        title: "Open a new agent and add a new personal skill.",
        promptType: "reusable",
        detail:
          "Open a new agent. Every time I ask a new agent to create an API, it forgets how to do it and scans the entire repository for the pattern. Let’s create a skill for it so the agent can do less work. Open skill in ~/.cursor/skills.",
        example:
          "/create-skill for how to create a new API. Follow the standards in this repo. This is a personal skill named create-api.",
      },
      {
        id: "promote-create-api-project",
        title: "Create a project skill.",
        promptType: "reusable",
        detail:
          "A teammate mentioned they were frustrated because they had to keep correcting the agent when it builds the API. They asked if they could also use the API skill.\nOpen skill in .cursor/skills\nReview the other project skills for this repository, such as add-dashboard-widget, draft-collection-email, or write-prisma-query.",
        example: "Promote the create-api skill to this project.",
      },
    ],
  },
  {
    id: "mcp-more-info",
    title: "How do you connect external tools?",
    beats: [
      {
        id: "add-linear-mcp",
        title: "Start the MCP server for the company issue tracker.",
        promptType: "none",
        detail:
          "Let’s start the issue tracker’s MCP server. For this workshop, that is Linear. Get a ticket for this project.\nReview MCP servers in Customize > MCPs\nEnable the Linear MCP server.",
      },
      {
        id: "mcp-allowlist",
        title: "Check your allowed MCP servers.",
        promptType: "none",
        detail:
          "Go to Settings > Agents > Execution and Approvals > Allowlist Options > MCP Allowlist to check valid MCP servers and tools from your administrator.",
      },
      {
        id: "start-issue-agent",
        title: "Start a new agent.",
        promptType: "none",
        detail:
          "Open a new agent. Someone reported a bug and it was logged in our issue tracker. I want more information on it.",
      },
      {
        id: "ask-linear-bug",
        title: "Retrieve a bug ticket from the issue tracker.",
        promptType: "adaptable",
        detail: "Review the tool calls to the Linear MCP server.",
        example: "List the open issues from our issue tracker.",
      },
      {
        id: "add-local-plugin",
        title: "Add the plugin.",
        promptType: "none",
        detail:
          "My teammate on another application let me know that they just created a plugin for standardizing and documenting bug fixes on our issue tracker. Go to Customize > Plugins > Add > From Local Repository. Find the plugins/standard-bug-fix file directory and add it.",
      },
      {
        id: "check-plugin",
        title: "Enable the “Standard bug fix” plugin.",
        promptType: "none",
        detail:
          "Go to Customize > Plugins. Go to Personal. Click Add to enable the “Standard bug fix” plugin. Show that the plugin has skills, rules, and MCP server.",
      },
      {
        id: "standard-bug-fix",
        title: "Fix the bug with the standard template.",
        promptType: "adaptable",
        detail:
          "Let’s fix the bug and update the issue with the standard template. Go to the issue in Linear and review the comments following the bug template.",
        example: "Work on a standard bug fix for the issue where clicking overdue does not filter.",
      },
    ],
  },
  {
    id: "parallelize-task",
    title: "How do you parallelize a task?",
    beats: [
      {
        id: "open-new-agent",
        title: "Start a new agent.",
        promptType: "none",
        detail:
          "Open a new agent. I created a plan for a feature to resolve disputes, splitting the work across three agents.",
      },
      {
        id: "open-resolve-dispute-plan",
        title: "Split the plan for three parallel agents.",
        promptType: "none",
        detail:
          "Open .cursor/plans/resolve-dispute.md. Review the plan and how it splits data, API, and UI tasks.",
      },
      {
        id: "open-ledgerly-reviewer",
        title: "The plan uses custom subagents to control how changes are made.",
        promptType: "none",
        detail:
          "For any changes to the application, there is a reviewer subagent to check changes.\nOpen .cursor/agents/ledgerly-reviewer.md",
      },
      {
        id: "open-dispatch-subagents-skill",
        title: "The plan has concrete steps for conflict resolution.",
        promptType: "none",
        detail:
          "Open .cursor/skills/dispatch-subagents/SKILL.md. This skill gives clear guidance to your agents that they should avoid making changes with conflicts.",
      },
      {
        id: "multitask-resolve-dispute",
        title: "Start multitasking.",
        promptType: "reusable",
        detail: "Build the feature using the /multitask command.",
        example: "/multitask @resolve-dispute.md",
      },
      {
        id: "canvas-subagent-progress",
        title: "Show the progress of subagents and tasks.",
        promptType: "adaptable",
        detail:
          "Use Canvas to keep track of the progress of subagents and their tasks. Review Canvas with subagent progress and worktree conflicts.",
        example:
          "Update Canvas with subagent progress and models used. Make a list of worktree conflicts as you encounter them.",
      },
      {
        id: "ledgerly-reviewer-check",
        title: "Verify the task completed with the subagent.",
        promptType: "adaptable",
        detail: "Use the specialized reviewer subagent to check the completed task.",
        example: "ledgerly-reviewer check my work",
      },
    ],
  },
] as const satisfies readonly DemoSection[];
