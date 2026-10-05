import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  RUNBOOK_SECTIONS_101,
  RUNBOOK_SECTIONS_201,
  RUNBOOK_SECTIONS_301,
  RUNBOOK_TRACKS,
  runbookBeatSequence,
  runbookBeats,
} from "@/lib/runbooks/meta";

const root = process.cwd();
const beats101 = runbookBeats("101");
const beats201 = runbookBeats("201");
const beats301 = runbookBeats("301");

describe("runbook catalog", () => {
  it("ships the 101, 201, and 301 tracks", () => {
    expect(RUNBOOK_TRACKS.map((track) => track.id)).toEqual(["101", "201", "301"]);

    const track101 = RUNBOOK_TRACKS.find((track) => track.id === "101");
    const track201 = RUNBOOK_TRACKS.find((track) => track.id === "201");
    const track301 = RUNBOOK_TRACKS.find((track) => track.id === "301");

    expect(track101?.description).toBe(
      "You will explore different ways to work in Grok Build, use modes and models for the right tasks, apply rules and skills to ensure consistent quality, and complete at least one task with an agent.",
    );
    expect(track201?.description).toBe(
      "You will curate what belongs in an agent's context, encode conventions as project skills, connect a curated set of MCP servers, and split one task across parallel agents.",
    );
    expect(track301?.description).toBe(
      "You will orchestrate work across agents, tasks, and contributors: break tasks down for multiple agents, take a plan through parallel agents to a reviewable PR, scale review when several streams finish, and share ownership safely.",
    );

    for (const track of RUNBOOK_TRACKS) {
      expect(track).not.toHaveProperty("runbookSlugs");
    }
  });

  it("keeps the 101 beats intact", () => {
    const skill = readFileSync(join(root, ".cursor/skills/choose-cursor-workflow/SKILL.md"), "utf8");
    const track101 = RUNBOOK_TRACKS.find((track) => track.id === "101");
    expect(skill).toContain(track101?.description ?? "");

    expect(runbookBeatSequence("101")).toBe(
      "Ask → Plan → Build in Agent mode → Debug → Check the models → Plan to fix the bug → Run Mode Allowlist → Verify the email feature → Redact (partial) → Stop the prompt → Interrupt and steer → Continue to the end → Review diffs → Restore from a checkpoint → Create a user rule → Test the rule → Create a user skill → Test the skill → Canvas → MCP / Figma",
    );

    expect(beats101.map((beat) => beat.id)).toEqual([
      "ask",
      "plan",
      "agent-build",
      "debug",
      "model-fast",
      "fix",
      "allowlist",
      "verify-email",
      "start-and-stop",
      "stop",
      "interrupt-steer",
      "continue-no-approval",
      "diffs",
      "checkpoint-restore",
      "rule",
      "test-rule",
      "skill",
      "test-skill",
      "canvas",
      "mcp",
    ]);

    const beat = (id: (typeof beats101)[number]["id"]) => beats101.find((entry) => entry.id === id);

    expect(beat("ask")?.detail).toBe("Let’s learn more about the application with Ask mode.");
    expect(beat("ask")?.example).toBe("/ask Tell me what this application does in 3 sentences");
    expect(beat("plan")?.detail).toBe("Map your approach to building a new feature in Plan mode.");
    expect(beat("plan")?.example).toBe(
      "/plan I want a new feature to update the customer email in the invoice detail customer card. Don’t implement email validation.",
    );
    expect(beat("agent-build")?.detail).toBe(
      "Build the feature in Agent mode. Build the plan locally. Check the feature in the UI.",
    );
    expect(beat("agent-build")?.example).toBeUndefined();
    expect(beat("debug")?.detail).toBe(
      "Investigate the failing test using Debug mode. Debug mode is useful because the agent investigates the codebase and presents some hypothesis on the root cause. I can choose to reproduce the bug and attempt to fix based on the agent’s hypotheses.",
    );
    expect(beat("debug")?.example).toBe("/debug the failing test");
    expect(beat("model-fast")?.title).toBe("Check the models");
    expect(beat("model-fast")?.promptType).toBe("none");
    expect(beat("model-fast")?.detail).toBe(
      "Check the models available for use. Select Auto in the chat and review the models available for use.",
    );
    expect(beat("model-fast")?.example).toBeUndefined();
    expect(beat("fix")?.detail).toBe("Use shift-tab to toggle to Agent mode.");
    expect(beat("fix")?.example).toBe("Fix the failing test.");
    expect(beat("allowlist")?.example).toBeUndefined();
    expect(beat("allowlist")?.detail).toBe(
      "Let’s change how our agent asks for approvals by configuring an allowlist - a known set of commands that Grok Build can run without asking for review. Go to Settings > Agents > Executions & Approvals > Run Mode > Allowlist.",
    );
    expect(beat("verify-email")?.promptType).toBe("none");
    expect(beat("verify-email")?.example).toBeUndefined();
    expect(beat("verify-email")?.detail).toBe(
      "Go to http://localhost:43173/invoices/inv_1048. Find the edit email feature you implemented in the Customer box.",
    );
    expect(beat("start-and-stop")?.title).toBe("Redact (partial)");
    expect(beat("start-and-stop")?.detail).toBe("");
    expect(beat("start-and-stop")?.example).toBe(
      "Redact the customer email in the UI. The first two characters and domain are plaintext. When I click to type in the box, clear it and save the new email.",
    );
    expect(beat("stop")?.example).toBeUndefined();
    expect(beat("stop")?.detail).toBe("Stop the prompt with the Stop button in the chat.");
    expect(beat("interrupt-steer")?.detail).toBe(
      "Steer the prompt. Show how the agent pauses for your approval. Continue running after reviewing the first file.",
    );
    expect(beat("interrupt-steer")?.example).toBe(
      "Redact the customer email in the UI. Show it in plaintext when I click the box to edit it. Stop every time you change a file for me to review.",
    );
    expect(beat("continue-no-approval")?.detail).toBe("");
    expect(beat("continue-no-approval")?.example).toBe(
      "Continue to the end, do not wait for my approval.",
    );
    expect(beat("diffs")?.example).toBeUndefined();
    expect(beat("diffs")?.detail).toBe(
      "Select Changes in the right hand panel. Show diffs from agent’s last turn.",
    );
    expect(beat("checkpoint-restore")?.title).toBe("Restore from a checkpoint");
    expect(beat("checkpoint-restore")?.promptType).toBe("none");
    expect(beat("checkpoint-restore")?.example).toBeUndefined();
    expect(beat("checkpoint-restore")?.detail).toBe(
      "If I want to revert the code, I can restore from a checkpoint. Scroll back to a prompt before updating the feature. Select the restore icon next to the prompt.",
    );
    expect(beat("rule")?.detail).toBe(
      "Let’s create a user rule so the agent doesn’t try to improve the invoice UI without our approval. Use /create-rule, a built-in skill, to create a rule. Go to Customize > Rules > User to view the rule.",
    );
    expect(beat("rule")?.example).toBe(
      "/create-rule Preserve the invoice view. Do not rename, restyle, or rearrange invoice screens unless the user names the **exact** new copy (or a specific layout change). This is a personal rule.",
    );
    expect(beat("test-rule")?.detail).toBe("");
    expect(beat("test-rule")?.example).toBe('Change "Line Items" in the UI to something else.');
    expect(beat("skill")?.detail).toBe(
      "Let’s create a user skill that tells me the domain breakdown and available APIs. Go to Customize > Skills to view the skill.",
    );
    expect(beat("skill")?.example).toBe(
      "/create-skill Use domain-driven design to break down the domains in this application and match it to available APIs or data schemas. This is a personal skill.",
    );
    expect(beat("test-skill")?.detail).toBe("");
    expect(beat("test-skill")?.example).toBe("Use domain-driven design on this application. Do not edit files.");
    expect(beat("canvas")?.title).toBe("Canvas");
    expect(beat("canvas")?.example).toBe("Create a canvas explaining what we did today.");
    expect(beat("mcp")?.title).toBe("MCP / Figma");
    expect(beat("mcp")?.detail).toBe(
      "Ask Grok Build to create a slideshow in Figma using MCP Servers. Find an MCP server for slideshow generation in Grok Build. Go to Customize > MCPs > Figma.",
    );
    expect(beat("mcp")?.example).toBe(
      "Create three slides in Figma Slides outlining how I used Grok Build to develop a new feature. I want to use this as part of my demo showcase.",
    );

    expect(beats101.every((entry) => entry.promptType !== undefined)).toBe(true);
    expect(beat("ask")?.promptType).toBe("reusable");
    expect(beat("plan")?.promptType).toBe("adaptable");
    expect(beat("agent-build")?.promptType).toBe("none");
    expect(RUNBOOK_SECTIONS_101.map((section) => section.title)).toEqual([
      "What is Grok Build?",
      "How do you work with an agent?",
      "How do you govern an agent?",
    ]);
    expect(
      RUNBOOK_SECTIONS_101.find((section) => section.id === "work-with-agent")?.beats.map(
        (entry) => entry.id,
      ),
    ).toEqual([
      "allowlist",
      "verify-email",
      "start-and-stop",
      "stop",
      "interrupt-steer",
      "continue-no-approval",
      "diffs",
      "checkpoint-restore",
    ]);
    expect(RUNBOOK_SECTIONS_101.flatMap((section) => section.beats.map((entry) => entry.id))).toEqual(
      beats101.map((entry) => entry.id),
    );
  });

  it("keeps the 201 beats intact", () => {
    const skill = readFileSync(join(root, ".cursor/skills/choose-cursor-workflow/SKILL.md"), "utf8");
    const track201 = RUNBOOK_TRACKS.find((track) => track.id === "201");
    expect(skill).toContain(track201?.description ?? "");

    expect(RUNBOOK_SECTIONS_201.map((section) => section.title)).toEqual([
      "How do you manage context?",
      "How do you standardize agent behavior?",
      "How do you connect an agent to external tools?",
      "How do you parallelize a task?",
    ]);
    expect(RUNBOOK_SECTIONS_201.map((section) => section.id)).toEqual([
      "target-context",
      "standardize-behavior",
      "mcp-more-info",
      "parallelize-task",
    ]);

    expect(beats201.map((beat) => beat.id)).toEqual([
      "rename-agent-1-all",
      "ask-ddd-all",
      "rename-agent-2-target",
      "ask-ddd-invoice-table",
      "context-usage",
      "compare-agents",
      "ask-cross-context",
      "create-api-personal-skill",
      "promote-create-api-project",
      "add-linear-mcp",
      "mcp-allowlist",
      "ask-linear-bug",
      "add-local-plugin",
      "check-plugin",
      "standard-bug-fix",
      "open-new-agent",
      "open-resolve-dispute-plan",
      "open-ledgerly-reviewer",
      "open-dispatch-subagents-skill",
      "multitask-resolve-dispute",
      "canvas-subagent-progress",
      "ledgerly-reviewer-check",
    ]);
    expect(RUNBOOK_SECTIONS_201.flatMap((section) => section.beats.map((entry) => entry.id))).toEqual(
      beats201.map((entry) => entry.id),
    );

    const beat = (id: (typeof beats201)[number]["id"]) => beats201.find((entry) => entry.id === id);

    expect(beat("rename-agent-1-all")?.detail).toBe(
      "Open one agent and ask it for information about the entire codebase.",
    );
    expect(beat("rename-agent-1-all")?.example).toBe("/rename-chat Agent 1 All");
    expect(beat("ask-ddd-all")?.detail).toBe("");
    expect(beat("ask-ddd-all")?.example).toBe(
      "/ask what is the domain driven design of the application.",
    );
    expect(beat("rename-agent-2-target")?.detail).toBe(
      "Open a second agent for a new targeted context window.",
    );
    expect(beat("rename-agent-2-target")?.example).toBe("/rename-chat Agent 2 Target");
    expect(beat("ask-ddd-invoice-table")?.detail).toBe("");
    expect(beat("ask-ddd-invoice-table")?.example).toBe(
      "/ask what is the domain driven design of the @invoice-table.tsx",
    );
    expect(beat("context-usage")?.promptType).toBe("none");
    expect(beat("context-usage")?.detail).toBe(
      "Go to Agent 1 All chat. Click the Context Usage indicator below the chat. Go to Agent 2 Target. Click the Context Usage indicator below the chat.",
    );
    expect(beat("context-usage")?.example).toBeUndefined();
    expect(beat("compare-agents")?.promptType).toBe("none");
    expect(beat("compare-agents")?.example).toBeUndefined();
    expect(beat("compare-agents")?.detail).toBe(
      "Agent 1 maps all the domains in the whole codebase. Its context window shows X%. Agent 2 maps half of the domains based on the targeted context. Its context window shows Y%. The difference in context window may not be significant but can affect larger repositories.",
    );
    expect(beat("ask-cross-context")?.detail).toBe(
      "Agent 1 mapped all domains; Agent 2 can reuse that summary. Go to Agent 2 Target chat.",
    );
    expect(beat("ask-cross-context")?.example).toBe(
      "/ask @Agent 1 All Does refactoring the table change anything across all contexts?",
    );
    expect(beat("create-api-personal-skill")?.detail).toBe(
      "Open a new agent. It scans the entire repository for the pattern. Create a personal skill for how to create a new API. Open skill in ~/.cursor/skills.",
    );
    expect(beat("create-api-personal-skill")?.example).toBe(
      "/create-skill for how to create a new API. Follow the standards in this repo. This is a personal skill named create-api.",
    );
    expect(beat("promote-create-api-project")?.detail).toBe(
      "Promote the create-api skill so teammates can use it. Open skill in .cursor/skills. Review the other project skills for this repository, such as add-dashboard-widget, draft-collection-email, or write-prisma-query.",
    );
    expect(beat("promote-create-api-project")?.example).toBe("Promote the create-api skill to this project.");
    expect(beat("add-linear-mcp")?.detail).toBe(
      "Let’s start the issue tracker’s MCP server. For this workshop, that is Linear. Get a ticket for this project. Review MCP servers in Customize > MCPs. Enable the Linear MCP server.",
    );
    expect(beat("add-linear-mcp")?.example).toBeUndefined();
    expect(beat("mcp-allowlist")?.promptType).toBe("none");
    expect(beat("mcp-allowlist")?.example).toBeUndefined();
    expect(beat("mcp-allowlist")?.detail).toBe(
      "Go to Settings > Agents > Execution and Approvals > Allowlist Options > MCP Allowlist to check valid MCP servers and tools from your administrator.",
    );
    expect(beat("ask-linear-bug")?.detail).toBe(
      "Open a new agent. Someone reported a bug and it was logged in our issue tracker. I want more information on it. Review the tool calls to the Linear MCP server.",
    );
    expect(beat("ask-linear-bug")?.example).toBe("List the open issues from our issue tracker.");
    expect(beat("add-local-plugin")?.promptType).toBe("none");
    expect(beat("add-local-plugin")?.example).toBeUndefined();
    expect(beat("add-local-plugin")?.detail).toBe(
      "A teammate created a plugin for standardizing bug fixes. Go to Customize > Plugins > Add > From Local Repository. Find the plugins/standard-bug-fix file directory and add it.",
    );
    expect(beat("check-plugin")?.promptType).toBe("none");
    expect(beat("check-plugin")?.example).toBeUndefined();
    expect(beat("check-plugin")?.detail).toBe(
      "Go to Customize > Plugins. Go to Personal. Click Add to enable the “Standard bug fix” plugin. Show that the plugin has skills, rules, and MCP server.",
    );
    expect(beat("standard-bug-fix")?.detail).toBe(
      "Let’s fix the bug and update the issue with the standard template. Go to the issue in Linear and review the comments following the bug template.",
    );
    expect(beat("standard-bug-fix")?.example).toBe(
      "Work on a standard bug fix for the issue where clicking overdue does not filter.",
    );
    expect(beat("open-new-agent")?.title).toBe("Open a new agent");
    expect(beat("open-new-agent")?.promptType).toBe("none");
    expect(beat("open-new-agent")?.example).toBeUndefined();
    expect(beat("open-new-agent")?.detail).toBe("Open a new agent.");
    expect(beat("open-resolve-dispute-plan")?.promptType).toBe("none");
    expect(beat("open-resolve-dispute-plan")?.example).toBeUndefined();
    expect(beat("open-resolve-dispute-plan")?.detail).toBe(
      "Open .cursor/plans/resolve-dispute.md. Review the plan and how it splits data, API, and UI tasks.",
    );
    expect(beat("open-ledgerly-reviewer")?.promptType).toBe("none");
    expect(beat("open-ledgerly-reviewer")?.example).toBeUndefined();
    expect(beat("open-ledgerly-reviewer")?.detail).toBe("Open .cursor/agents/ledgerly-reviewer.md");
    expect(beat("open-dispatch-subagents-skill")?.promptType).toBe("none");
    expect(beat("open-dispatch-subagents-skill")?.example).toBeUndefined();
    expect(beat("open-dispatch-subagents-skill")?.detail).toBe(
      "Open .cursor/skills/dispatch-subagents/SKILL.md.",
    );
    expect(beat("multitask-resolve-dispute")?.detail).toBe(
      "Build the feature using the /multitask command.",
    );
    expect(beat("multitask-resolve-dispute")?.example).toBe("/multitask @resolve-dispute.md");
    expect(beat("canvas-subagent-progress")?.promptType).toBe("adaptable");
    expect(beat("canvas-subagent-progress")?.detail).toBe(
      "Use Canvas to keep track of the progress of subagents and their tasks. Review Canvas with subagent progress and worktree conflicts.",
    );
    expect(beat("canvas-subagent-progress")?.example).toBe(
      "Update Canvas with subagent progress and models used. Make a list of worktree conflicts as you encounter them.",
    );
    expect(beat("ledgerly-reviewer-check")?.detail).toBe(
      "Use the specialized reviewer subagent to check the completed task.",
    );
    expect(beat("ledgerly-reviewer-check")?.example).toBe("ledgerly-reviewer check my work");

    expect(beats201.every((entry) => entry.promptType !== undefined)).toBe(true);
    expect(beat("rename-agent-1-all")?.promptType).toBe("reusable");
    expect(beat("ask-ddd-all")?.promptType).toBe("reusable");
    expect(beat("rename-agent-2-target")?.promptType).toBe("reusable");
    expect(beat("ask-ddd-invoice-table")?.promptType).toBe("reusable");
    expect(beat("context-usage")?.promptType).toBe("none");
    expect(beat("ask-cross-context")?.promptType).toBe("reusable");
    expect(beat("create-api-personal-skill")?.promptType).toBe("reusable");
    expect(beat("promote-create-api-project")?.promptType).toBe("reusable");
    expect(beat("add-linear-mcp")?.promptType).toBe("none");
    expect(beat("ask-linear-bug")?.promptType).toBe("adaptable");
    expect(beat("standard-bug-fix")?.promptType).toBe("adaptable");
    expect(beat("open-new-agent")?.promptType).toBe("none");
    expect(beat("multitask-resolve-dispute")?.promptType).toBe("reusable");
    expect(beat("canvas-subagent-progress")?.promptType).toBe("adaptable");
    expect(beat("ledgerly-reviewer-check")?.promptType).toBe("adaptable");
  });

  it("keeps the 301 beats intact", () => {
    const skill = readFileSync(join(root, ".cursor/skills/choose-cursor-workflow/SKILL.md"), "utf8");
    const track301 = RUNBOOK_TRACKS.find((track) => track.id === "301");
    expect(skill).toContain(track301?.description ?? "");
    expect(skill).toContain("/runbooks/301");

    expect(RUNBOOK_SECTIONS_301.map((section) => section.title)).toEqual([
      "How do you break down tasks for agents?",
      "How do multiple agents go from plan to PR?",
      "How do you scale AI code reviews?",
      "How do contributors share ownership safely?",
    ]);
    expect(RUNBOOK_SECTIONS_301.map((section) => section.id)).toEqual([
      "break-down-tasks",
      "plan-to-pr",
      "scale-reviews",
      "share-ownership",
    ]);

    expect(beats301.map((beat) => beat.id)).toEqual([
      "open-local-agent",
      "create-accessibility-auditor",
      "optional-cloud-agent",
      "multitask-audit",
      "review-subagents",
      "optional-start-project",
      "optional-stage-project",
      "open-plan-agent",
      "list-collections-issues",
      "plan-collections-center",
      "review-plan",
      "build-plan",
      "optional-build-cloud",
      "side-chat",
      "ask-new-apis",
      "consolidate-pr",
      "optional-project-notes",
      "linear-issue-fallback",
      "checkout-feature-branch",
      "open-hooks-json",
      "trigger-email-hook",
      "run-reviewer-subagent",
      "check-high-severity",
      "optional-bugbot",
      "review-highest-risk",
      "open-ownership-agent",
      "shift-left-findings",
      "optional-reviewer-automation",
      "list-conflict-files",
    ]);
    expect(RUNBOOK_SECTIONS_301.flatMap((section) => section.beats.map((entry) => entry.id))).toEqual(
      beats301.map((entry) => entry.id),
    );
    expect(runbookBeatSequence("301")).toBe(
      "Open a new agent → Create accessibility-auditor → Optional: Move to a Cloud Agent → Multitask the audit → Review the subagents → Optional: Start a new Project → Optional: Stage the Project → Open a new agent → List open collections issues → Plan the collections command center → Review the plan → Build the plan → Optional: Build with Cloud Agents → Open a side chat → Ask what APIs the subagent adds → Consolidate and open a PR → Optional: Show project notes → Fallback: reference repo issues → Open the feature branch → Open hooks.json → Trigger the dataset hook → Run the reviewer subagent → Check high severity issues → Optional: Run Bugbot → Review the highest-risk slice → Open a new agent → Shift review findings left → Optional: Create a Reviewer automation → List files that might conflict",
    );

    const beat = (id: (typeof beats301)[number]["id"]) => beats301.find((entry) => entry.id === id);

    expect(beat("open-local-agent")?.promptType).toBe("none");
    expect(beat("open-local-agent")?.detail).toBe("Open a new local agent.");
    expect(beat("open-local-agent")?.example).toBeUndefined();
    expect(beat("create-accessibility-auditor")?.promptType).toBe("adaptable");
    expect(beat("create-accessibility-auditor")?.detail).toBe("");
    expect(beat("create-accessibility-auditor")?.example).toBe(
      "/create-subagent named accessibility-auditor whose job is to audit accessibility of the UI based on WCAG. Provide a list of recommendations.",
    );
    expect(beat("optional-cloud-agent")?.promptType).toBe("none");
    expect(beat("optional-cloud-agent")?.detail).toBe(
      "Click Continue on Cloud to move this to a Cloud Agent. Click Include Changes.",
    );
    expect(beat("optional-cloud-agent")?.example).toBeUndefined();
    expect(beat("multitask-audit")?.promptType).toBe("reusable");
    expect(beat("multitask-audit")?.detail).toBe("");
    expect(beat("multitask-audit")?.example).toBe(
      "/multitask Use the accessibility-auditor subagent to audit the invoices page. Explain how suggested credit is calculated. Compare test coverage for disputes versus invoices.",
    );
    expect(beat("review-subagents")?.promptType).toBe("none");
    expect(beat("review-subagents")?.detail).toBe("Watch the Working tab.");
    expect(beat("review-subagents")?.example).toBeUndefined();

    expect(beat("optional-start-project")?.promptType).toBe("none");
    expect(beat("optional-start-project")?.detail).toBe(
      "Start a new Project. Name it {INSERT COMPANY HERE, default is Ledgerly}.",
    );
    expect(beat("optional-stage-project")?.promptType).toBe("adaptable");
    expect(beat("optional-stage-project")?.detail).toBe("");
    expect(beat("optional-stage-project")?.example).toBe(
      "Run all agents in their own worktrees. Parallelize if possible.",
    );
    expect(beat("open-plan-agent")?.promptType).toBe("none");
    expect(beat("open-plan-agent")?.detail).toBe(
      "Open a new local agent. Optional: Run the following prompts from the Project.",
    );
    expect(beat("list-collections-issues")?.promptType).toBe("adaptable");
    expect(beat("list-collections-issues")?.detail).toBe("Review the list of open issues.");
    expect(beat("list-collections-issues")?.example).toBe(
      "List the open issues for building the collections command center.",
    );
    expect(beat("plan-collections-center")?.promptType).toBe("adaptable");
    expect(beat("plan-collections-center")?.detail).toBe("");
    expect(beat("plan-collections-center")?.example).toBe(
      "/plan Build the collections command center based on the open issues.",
    );
    expect(beat("review-plan")?.promptType).toBe("none");
    expect(beat("review-plan")?.detail).toBe("Review the plan.");
    expect(beat("build-plan")?.promptType).toBe("none");
    expect(beat("build-plan")?.detail).toBe("Build the plan.");
    expect(beat("optional-build-cloud")?.promptType).toBe("none");
    expect(beat("optional-build-cloud")?.detail).toBe("Build the plan with Cloud Agents.");
    expect(beat("side-chat")?.promptType).toBe("reusable");
    expect(beat("side-chat")?.detail).toBe("");
    expect(beat("side-chat")?.example).toBe("/side");
    expect(beat("ask-new-apis")?.promptType).toBe("reusable");
    expect(beat("ask-new-apis")?.detail).toBe(
      "Use a side chat to read through implementation or ask questions without disrupting the coordinator.",
    );
    expect(beat("ask-new-apis")?.example).toBe("/ask what new APIs will this first subagent add?");
    expect(beat("consolidate-pr")?.promptType).toBe("reusable");
    expect(beat("consolidate-pr")?.detail).toBe(
      "Move finished worktrees back deliberately. Resolve conflicts on purpose. Open the PR. Show the summary a colleague would read first.",
    );
    expect(beat("consolidate-pr")?.example).toBe(
      "Consolidate the completed tasks into one branch. Open a PR that summarizes what each lane changed, links the plan or ticket, and lists what a human should verify before merge.",
    );
    expect(beat("optional-project-notes")?.promptType).toBe("adaptable");
    expect(beat("optional-project-notes")?.detail).toBe("");
    expect(beat("optional-project-notes")?.example).toBe("Show me the project notes and context.");
    expect(beat("linear-issue-fallback")?.promptType).toBe("adaptable");
    expect(beat("linear-issue-fallback")?.detail).toBe(
      "If an agent cannot access Linear MCP server, use the issue descriptions in the repository.",
    );
    expect(beat("linear-issue-fallback")?.example).toBe(
      "Reference issues from @linear-field-demo.ts instead of Linear",
    );

    expect(beat("checkout-feature-branch")?.promptType).toBe("adaptable");
    expect(beat("checkout-feature-branch")?.detail).toBe("Open a new local agent.");
    expect(beat("checkout-feature-branch")?.example).toBe(
      "Change the branch to the collections command center feature.",
    );
    expect(beat("open-hooks-json")?.promptType).toBe("none");
    expect(beat("open-hooks-json")?.detail).toBe("Open .cursor/hooks.json in the demo repo.");
    expect(beat("trigger-email-hook")?.promptType).toBe("reusable");
    expect(beat("trigger-email-hook")?.detail).toBe("");
    expect(beat("trigger-email-hook")?.example).toBe(
      "Create a test that uses the email avery.quinn@ledgerly.ai",
    );
    expect(beat("run-reviewer-subagent")?.promptType).toBe("reusable");
    expect(beat("run-reviewer-subagent")?.detail).toBe("");
    expect(beat("run-reviewer-subagent")?.example).toBe(
      "Use the custom reviewer subagent to review the feature.",
    );
    expect(beat("check-high-severity")?.promptType).toBe("none");
    expect(beat("check-high-severity")?.detail).toBe(
      "Check the reviewer’s output for any high severity issues to assess.",
    );
    expect(beat("optional-bugbot")?.promptType).toBe("reusable");
    expect(beat("optional-bugbot")?.detail).toBe("");
    expect(beat("optional-bugbot")?.example).toBe("/review-bugbot");
    expect(beat("review-highest-risk")?.promptType).toBe("reusable");
    expect(beat("review-highest-risk")?.detail).toBe(
      "Open the highest-risk slice first and read it line by line.",
    );
    expect(beat("review-highest-risk")?.example).toBe(
      "/ask What is the highest-risk slice of work? Show me the lines I need to review.",
    );

    expect(beat("open-ownership-agent")?.promptType).toBe("none");
    expect(beat("open-ownership-agent")?.detail).toBe("Open a new local agent.");
    expect(beat("shift-left-findings")?.promptType).toBe("reusable");
    expect(beat("shift-left-findings")?.detail).toBe("");
    expect(beat("shift-left-findings")?.example).toBe(
      "Read the review comments and reviewer subagent findings on this PR. List the ones that apply to future work in this repo. For each one, say whether it belongs in a rule, a skill, a hook, a test, the reviewer subagent, or a person, and draft it.",
    );
    expect(beat("optional-reviewer-automation")?.promptType).toBe("adaptable");
    expect(beat("optional-reviewer-automation")?.detail).toBe(
      "Go to the Automations tab. Create a New Automation. Name it Reviewer. Select the demo repository. Click Triggers > PR opened, then select the demo repository and set the author to Anyone. Add “Run custom reviewer subagent” to agent instructions. Add “Comment on Pull Request” to tools. Click Save. Open the PR and review the check for Automation: Reviewer.",
    );
    expect(beat("optional-reviewer-automation")?.example).toBe("Fix dispute cap issue and open a PR.");
    expect(beat("list-conflict-files")?.promptType).toBe("reusable");
    expect(beat("list-conflict-files")?.detail).toBe(
      "Start a new local agent as the second contributor.",
    );
    expect(beat("list-conflict-files")?.example).toBe(
      "Check the PRs in this repository and make a list of files that might conflict with implementing the dispute resolution feature.",
    );

    expect(beats301.every((entry) => entry.promptType !== undefined)).toBe(true);
    expect(beats301.filter((entry) => entry.promptType === "none").every((entry) => entry.example === undefined)).toBe(
      true,
    );
  });

  it("does not resolve the retired advanced track", () => {
    expect(RUNBOOK_TRACKS).toHaveLength(3);
    for (const retired of ["advanced", "Advanced"]) {
      expect(RUNBOOK_TRACKS.find((track) => track.id === retired)).toBeUndefined();
    }
  });

  it("gives each section a unique id and no Demo N labels", () => {
    for (const track of RUNBOOK_TRACKS) {
      const sectionIds = track.sections.map((section) => section.id);
      expect(sectionIds).toEqual([...new Set(sectionIds)]);
      for (const section of track.sections) {
        expect(section.title).not.toMatch(/^Demo \d+$/);
      }
    }
  });

  it("points docs, skills, and rules at /runbooks and documents both tracks", () => {
    const files = {
      readme: readFileSync(join(root, "README.md"), "utf8"),
      howto: readFileSync(join(root, "demo-howto.md"), "utf8"),
      agents: readFileSync(join(root, "AGENTS.md"), "utf8"),
      rule: readFileSync(join(root, ".cursor/rules/ledgerly.mdc"), "utf8"),
      skill: readFileSync(join(root, ".cursor/skills/choose-cursor-workflow/SKILL.md"), "utf8"),
      cloud: readFileSync(join(root, ".cursor/skills/hand-to-cloud-agent/SKILL.md"), "utf8"),
      reset: readFileSync(join(root, ".cursor/skills/reset-demo-state/SKILL.md"), "utf8"),
    };

    for (const [name, contents] of Object.entries(files)) {
      expect(contents, `${name} still cites lib/workflows/meta.ts`).not.toContain(
        "lib/workflows/meta.ts",
      );
      expect(contents, `${name} still references a retired Advanced track`).not.toMatch(
        /Advanced track/,
      );
    }

    expect(files.readme).toContain("/runbooks/201");
    expect(files.howto).toContain("/runbooks/201");
    expect(files.skill).toContain("/runbooks/201");
    expect(files.readme).toContain("/runbooks/301");
    expect(files.howto).toContain("/runbooks/301");
    expect(files.skill).toContain("/runbooks/301");
    expect(files.agents).toContain("/runbooks/301");
    expect(files.rule).toContain("/runbooks/301");
    expect(files.agents).toContain("lib/runbooks/meta.ts");
    expect(files.rule).toContain("lib/runbooks/meta.ts");
    expect(files.skill).toContain("lib/runbooks/meta.ts");
    expect(files.cloud).toContain("Cloud Agent");

    // Shipped-suite count must stay consistent across the docs that cite it
    // (see the sync rule in .cursor/rules/ledgerly.mdc). Assert the
    // "1 failed / <n> passed" format is present in each and that every file
    // agrees, so changing the count only means updating the docs — not this
    // assertion.
    const countPattern = /1 failed \/ (\d+) passed/g;
    const countSources: Record<string, string> = {
      readme: files.readme,
      howto: files.howto,
      agents: files.agents,
      reset: files.reset,
      plan: readFileSync(join(root, ".cursor/plans/resolve-dispute.md"), "utf8"),
    };
    const passedCounts = new Set<string>();
    for (const [name, contents] of Object.entries(countSources)) {
      const matches = [...contents.matchAll(countPattern)].map((match) => match[1]);
      expect(matches.length, `${name} is missing a "1 failed / <n> passed" count`).toBeGreaterThan(
        0,
      );
      for (const passed of matches) passedCounts.add(passed);
    }
    expect(
      passedCounts.size,
      `shipped-suite count disagrees across docs: ${[...passedCounts].join(", ")}`,
    ).toBe(1);

    expect(files.reset).toContain("stage-linear");
    expect(files.reset).not.toContain("stage-linear-201");
    expect(files.reset).toContain("FIELD_DEMO_ISSUES");
    expect(files.reset).toContain("Canceled");
    expect(files.agents).toContain("stage-linear");
    expect(files.agents).not.toContain("stage-linear-201");
    expect(files.rule).toContain("stage-linear");
    expect(files.rule).not.toContain("stage-linear-201");
    expect(files.skill).toContain("stage-linear");
    expect(files.skill).not.toContain("stage-linear-201");
    expect(files.howto).toContain("stage-linear");
    expect(files.howto).not.toContain("stage-linear-201");
    expect(files.readme).toContain("Settings → Teams → New team");
    expect(files.readme).toContain("Make team private");
    expect(files.howto).toContain("Settings → Teams → New team");
    expect(files.howto).toContain("Make team private");
    expect(files.agents).toContain("Settings → Teams → New team");
    expect(files.agents).toContain("Make team private");
    expect(files.rule).toContain("Make team private");
    expect(files.readme).toContain("settings/teams/LY");
    expect(files.howto).toContain("settings/teams/LY");
    expect(files.agents).toContain("settings/teams/LY");
  });

  it("stage-linear and reset-demo-state confirm the private team before writing", () => {
    const stage = readFileSync(join(root, ".cursor/skills/stage-linear/SKILL.md"), "utf8");
    const reset = readFileSync(join(root, ".cursor/skills/reset-demo-state/SKILL.md"), "utf8");

    for (const [name, contents] of Object.entries({ stage, reset })) {
      expect(contents, `${name} is missing a confirm-team step`).toMatch(/confirm/i);
      expect(contents, `${name} is missing the team settings URL`).toContain("settings/teams");
      expect(contents, `${name} should refuse to guess the team`).toMatch(/assume|guess/i);
    }

    // reset cancels the board but no longer unlinks issues from the project
    expect(reset).toContain("Canceled");
    expect(reset, "reset should no longer unlink issues").not.toContain("unlink from the board");
    expect(reset, "reset should leave issues linked").toContain("Leave the issue linked");
    expect(reset, "reset description should not gate Linear on this session staging").not.toMatch(
      /cancel Linear issues if this demo staged them/,
    );
    expect(reset, "reset should offer Linear teardown when MCP is connected").toMatch(
      /whenever the Linear MCP is connected/,
    );
    expect(reset, "reset must delete git branches from the 201 standard-bug-fix beat").toContain(
      "Demo-beat git branches",
    );
    expect(reset, "reset must switch off the demo branch").toContain("git checkout main");
    expect(reset, "reset must delete the local demo-beat branch").toContain("git branch -D");
    expect(reset, "reset must delete a pushed demo-beat branch").toContain(
      "git push origin --delete",
    );
    expect(reset, "reset must restore invoice and dispute pages that read state=").toContain(
      "app/invoices/page.tsx",
    );
    expect(reset, "reset must restore dispute queue pages").toContain("app/disputes/page.tsx");

    // stage-linear reactivates a torn-down board on the next run
    expect(stage).toMatch(/reactivate|reopen|reopens/i);
    expect(stage, "stage must create a new issue instead of unarchiving").toMatch(
      /Never unarchive an issue/,
    );
    // confirm counts only active issues so canceled linked extras do not fail the check
    expect(stage, "stage confirm must count only active issues").toMatch(
      /active.*non-`?Canceled`?|non-`?Canceled`?.*active/i,
    );
    expect(stage, "stage confirm must not require every linked issue to be catalog").not.toContain(
      "list_issues` on the project returns exactly the three catalog titles",
    );
  });
});
