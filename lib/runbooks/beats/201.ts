import type { DemoSection } from "@/lib/runbooks/types";

export const RUNBOOK_SECTIONS_201 = [
  {
    id: "target-context",
    title: "Why is my agent ignoring my instructions?",
    beats: [
      {
        id: "rename-agent-1-all",
        title: "Rename Agent 1 All",
        promptType: "adaptable",
        detail: "Open one agent and ask it for information about the entire codebase.",
        example: "/rename-chat Agent 1 All",
      },
      {
        id: "canvas-all-domains",
        title: "Canvas: full codebase DDD",
        promptType: "adaptable",
        detail: "Ask the all-codebase agent to map domain-driven design in Canvas.",
        example: "Show me the domain driven design of the application in Canvas.",
      },
      {
        id: "rename-agent-2-invoices",
        title: "Rename Agent 2 Invoices",
        promptType: "adaptable",
        detail: "Open a second agent for a new context window focused on invoices.",
        example: "/rename-chat Agent 2 Invoices",
      },
      {
        id: "canvas-invoice-table",
        title: "Canvas: invoice table DDD",
        promptType: "adaptable",
        detail: "Target context to @invoice-table.tsx and map domains in Canvas.",
        example: "Show me the domain driven design of @invoice-table.tsx in Canvas.",
      },
      {
        id: "ask-cross-context",
        title: "Ask across agents",
        promptType: "adaptable",
        detail:
          "Agent 1 mapped all domains; Agent 2 can reuse that summary without scanning the whole codebase again.",
        example: "/ask @Agent 1 All Does refactoring the table change anything across all contexts?",
      },
      {
        id: "context-usage",
        title: "Check context usage",
        promptType: "none",
        detail: "Click on the Context Usage indicator below the chat.",
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
        promptType: "adaptable",
        detail:
          "Create a personal skill for how to create a new API so the agent does less scanning. Open skill in ~/.cursor/skills.",
        example:
          "/create-skill for how to create a new API. Follow the standards in this repo. This is a personal skill named create-api.",
      },
      {
        id: "promote-create-api-project",
        title: "Promote create-api to project",
        promptType: "adaptable",
        detail: "Promote the create-api skill so teammates can use it. Open skill in .cursor/skills",
        example: "Promote the create-api skill to this project.",
      },
      {
        id: "create-eslint-rule",
        title: "Create ESLint rule",
        promptType: "adaptable",
        detail:
          "Use a linter hook instead of a long TypeScript formatting rule. Show hook in .cursor/hooks.json. Show script in hooks/eslint-changed.sh. Open app/disputes/[id]/page.tsx.",
        example:
          "/create-rule After editing .ts / .tsx files, leave them ESLint-clean. Do not add eslint-disable to silence new issues. Prefer fixing the code. The afterFileEdit hook runs ESLint on the file you changed.",
      },
      {
        id: "test-eslint-hook",
        title: "Test the ESLint hook",
        promptType: "adaptable",
        detail: "",
        example:
          "In app/disputes/[id]/page.tsx, add a local `let capUsd = formatUsd(catalogPrice)` and use capUsd in the Resolution CardDescription instead of calling formatUsd(catalogPrice) inline. Do not run eslint or prettier. Do not enable Accept or Decline. Do not change behavior otherwise.",
      },
    ],
  },
  {
    id: "mcp-more-info",
    title: "How does my agent get more information?",
    beats: [
      {
        id: "add-companyticket-mcp",
        title: "Add CompanyTicket MCP",
        promptType: "adaptable",
        detail:
          "Start the CompanyTicket MCP server for this project. Show MCP servers in Customize -> MCPs. Show CompanyTicket MCP server and the different tools you can enable.",
        example: "Add the CompanyTicket MCP server to this project.",
      },
      {
        id: "fix-ticket-ly-002",
        title: "Fix ticket LY-002",
        promptType: "adaptable",
        detail:
          "Pull a reported bug from the CompanyTicket backlog. Explore the tool calls to CompanyTicket MCP server.",
        example: "Fix ticket number LY-002",
      },
      {
        id: "import-marketplace-plugin",
        title: "Import marketplace plugin",
        promptType: "none",
        detail:
          "Go to Customize -> Browse Marketplace -> Add Marketplace -> Import from Disk. Import plugins/standard-bug-fix from the demo repository. Show that the plugin has skills, rules, and Linear MCP server.",
      },
      {
        id: "standard-bug-fix-ly-003",
        title: "Standard bug fix LY-003",
        promptType: "adaptable",
        detail: "",
        example: "/standard-bug-fix LY-003",
      },
    ],
  },
  {
    id: "parallelize-task",
    title: "How do I parallelize a task?",
    beats: [
      {
        id: "refine-plan-three-worktrees",
        title: "Refine plan for three worktrees",
        promptType: "adaptable",
        detail: "Split a resolve-disputes plan across three parallel worktree agents.",
        example:
          "@resolve-dispute.md Refine this plan for three parallel worktree agents. Split into exactly: (1) resolve helper (2) resolve API route (3) Resolution panel UI. For each, name owned files, the shared contract, and what I’ll verify when it finishes. Keep the same thin slice. Don’t implement. Don’t touch suggested-credit client/tests, seed, or catalog prices. API must import resolveDispute — do not inline Prisma persist.",
      },
      {
        id: "multitask-three-workstreams",
        title: "Multitask three workstreams",
        promptType: "adaptable",
        detail: "Build the feature using the /multitask command.",
        example:
          "/multitask Implement the three workstreams from this refined plan in parallel. Put each workstream in its own worktree. One agent per workstream: (1) resolve helper — only lib/disputes/resolve.ts, (2) resolve API route - only app/api/disputes/[id]/resolve/route.ts (import resolveDispute, do not inline Prisma), (3) Resolution panel UI - only the dispute detail Resolution panel (+ small client child if needed). Respect file ownership and the shared contract. Don’t touch suggested-credit client/tests, seed, or catalog prices. Mid-run 501 from the UI/API is OK until helper is applied. When all three finish, summarize each worktree’s diff and the apply order: helper → API → UI.",
      },
      {
        id: "verify-parallel-work",
        title: "Verify parallel work",
        promptType: "none",
        detail:
          "Open diffs for each agent. Check tests and linters. Open http://127.0.0.1:43173/disputes/dsp_1043. Add a reviewer note → Accept or Decline.",
      },
      {
        id: "best-of-n-release-note",
        title: "Best-of-n release note",
        promptType: "adaptable",
        detail: "Compare models for an ambiguous release-note draft.",
        example:
          "/best-of-n Draft a short product release note for finishing Accept/Decline on dispute resolution in Ledgerly. Audience: internal eng + CE. Include what shipped, how to verify on dsp_1043, and that suggested-credit v1→v2 is out of scope. No code changes. ~150 words.",
      },
    ],
  },
] as const satisfies readonly DemoSection[];
