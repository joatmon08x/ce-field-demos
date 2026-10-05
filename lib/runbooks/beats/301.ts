import type { DemoSection } from "@/lib/runbooks/types";

export const RUNBOOK_SECTIONS_301 = [
  {
    id: "break-down-tasks",
    title: "How do you break down tasks for agents?",
    beats: [
      {
        id: "open-local-agent",
        title: "Open a new agent",
        promptType: "none",
        detail: "Open a new local agent.",
      },
      {
        id: "create-accessibility-auditor",
        title: "Create accessibility-auditor",
        promptType: "adaptable",
        detail: "",
        example:
          "/create-subagent named accessibility-auditor whose job is to audit accessibility of the UI based on WCAG. Provide a list of recommendations.",
      },
      {
        id: "optional-cloud-agent",
        title: "Optional: Move to a Cloud Agent",
        promptType: "none",
        detail:
          "Click Continue on Cloud to move this to a Cloud Agent. Click Include Changes.",
      },
      {
        id: "multitask-audit",
        title: "Multitask the audit",
        promptType: "reusable",
        detail: "",
        example:
          "/multitask Use the accessibility-auditor subagent to audit the invoices page. Explain how suggested credit is calculated. Compare test coverage for disputes versus invoices.",
      },
      {
        id: "review-subagents",
        title: "Review the subagents",
        promptType: "none",
        detail: "Watch the Working tab.",
      },
    ],
  },
  {
    id: "plan-to-pr",
    title: "How do multiple agents go from plan to PR?",
    beats: [
      {
        id: "optional-start-project",
        title: "Optional: Start a new Project",
        promptType: "none",
        detail: "Start a new Project. Name it {INSERT COMPANY HERE, default is Ledgerly}.",
      },
      {
        id: "optional-stage-project",
        title: "Optional: Stage the Project",
        promptType: "adaptable",
        detail: "",
        example: "Run all agents in their own worktrees. Parallelize if possible.",
      },
      {
        id: "open-plan-agent",
        title: "Open a new agent",
        promptType: "none",
        detail: "Open a new local agent. Optional: Run the following prompts from the Project.",
      },
      {
        id: "list-collections-issues",
        title: "List open collections issues",
        promptType: "adaptable",
        detail: "Review the list of open issues.",
        example: "List the open issues for building the collections command center.",
      },
      {
        id: "plan-collections-center",
        title: "Plan the collections command center",
        promptType: "adaptable",
        detail: "",
        example: "/plan Build the collections command center based on the open issues.",
      },
      {
        id: "review-plan",
        title: "Review the plan",
        promptType: "none",
        detail: "Review the plan.",
      },
      {
        id: "build-plan",
        title: "Build the plan",
        promptType: "none",
        detail: "Build the plan.",
      },
      {
        id: "optional-build-cloud",
        title: "Optional: Build with Cloud Agents",
        promptType: "none",
        detail: "Build the plan with Cloud Agents.",
      },
      {
        id: "side-chat",
        title: "Open a side chat",
        promptType: "reusable",
        detail: "",
        example: "/side",
      },
      {
        id: "ask-new-apis",
        title: "Ask what APIs the subagent adds",
        promptType: "reusable",
        detail:
          "Use a side chat to read through implementation or ask questions without disrupting the coordinator.",
        example: "/ask what new APIs will this first subagent add?",
      },
      {
        id: "consolidate-pr",
        title: "Consolidate and open a PR",
        promptType: "reusable",
        detail:
          "Move finished worktrees back deliberately. Resolve conflicts on purpose. Open the PR. Show the summary a colleague would read first.",
        example:
          "Consolidate the completed tasks into one branch. Open a PR that summarizes what each lane changed, links the plan or ticket, and lists what a human should verify before merge.",
      },
      {
        id: "optional-project-notes",
        title: "Optional: Show project notes",
        promptType: "adaptable",
        detail: "",
        example: "Show me the project notes and context.",
      },
      {
        id: "linear-issue-fallback",
        title: "Fallback: reference repo issues",
        promptType: "adaptable",
        detail:
          "If an agent cannot access Linear MCP server, use the issue descriptions in the repository.",
        example: "Reference issues from @linear-field-demo.ts instead of Linear",
      },
    ],
  },
  {
    id: "scale-reviews",
    title: "How do you scale AI code reviews?",
    beats: [
      {
        id: "checkout-feature-branch",
        title: "Open the feature branch",
        promptType: "adaptable",
        detail: "Open a new local agent.",
        example: "Change the branch to the collections command center feature.",
      },
      {
        id: "open-hooks-json",
        title: "Open hooks.json",
        promptType: "none",
        detail: "Open .cursor/hooks.json in the demo repo.",
      },
      {
        id: "trigger-email-hook",
        title: "Trigger the dataset hook",
        promptType: "reusable",
        detail: "",
        example: "Create a test that uses the email avery.quinn@ledgerly.ai",
      },
      {
        id: "run-reviewer-subagent",
        title: "Run the reviewer subagent",
        promptType: "reusable",
        detail: "",
        example: "Use the custom reviewer subagent to review the feature.",
      },
      {
        id: "check-high-severity",
        title: "Check high severity issues",
        promptType: "none",
        detail: "Check the reviewer’s output for any high severity issues to assess.",
      },
      {
        id: "optional-bugbot",
        title: "Optional: Run Bugbot",
        promptType: "reusable",
        detail: "",
        example: "/review-bugbot",
      },
      {
        id: "review-highest-risk",
        title: "Review the highest-risk slice",
        promptType: "reusable",
        detail: "Open the highest-risk slice first and read it line by line.",
        example: "/ask What is the highest-risk slice of work? Show me the lines I need to review.",
      },
    ],
  },
  {
    id: "share-ownership",
    title: "How do contributors share ownership safely?",
    beats: [
      {
        id: "open-ownership-agent",
        title: "Open a new agent",
        promptType: "none",
        detail: "Open a new local agent.",
      },
      {
        id: "shift-left-findings",
        title: "Shift review findings left",
        promptType: "reusable",
        detail: "",
        example:
          "Read the review comments and reviewer subagent findings on this PR. List the ones that apply to future work in this repo. For each one, say whether it belongs in a rule, a skill, a hook, a test, the reviewer subagent, or a person, and draft it.",
      },
      {
        id: "optional-reviewer-automation",
        title: "Optional: Create a Reviewer automation",
        promptType: "adaptable",
        detail:
          "Go to the Automations tab. Create a New Automation. Name it Reviewer. Select the demo repository. Click Triggers > PR opened, then select the demo repository and set the author to Anyone. Add “Run custom reviewer subagent” to agent instructions. Add “Comment on Pull Request” to tools. Click Save. Open the PR and review the check for Automation: Reviewer.",
        example: "Fix dispute cap issue and open a PR.",
      },
      {
        id: "list-conflict-files",
        title: "List files that might conflict",
        promptType: "reusable",
        detail: "Start a new local agent as the second contributor.",
        example:
          "Check the PRs in this repository and make a list of files that might conflict with implementing the dispute resolution feature.",
      },
    ],
  },
] as const satisfies readonly DemoSection[];
