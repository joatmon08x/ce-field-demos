import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  RUNBOOK_SECTIONS_101,
  RUNBOOK_SECTIONS_201,
  RUNBOOK_TRACKS,
  runbookBeatSequence,
  runbookBeats,
} from "@/lib/runbooks/meta";

const root = process.cwd();
const beats101 = runbookBeats("101");
const beats201 = runbookBeats("201");

describe("runbook catalog", () => {
  it("ships the 101 and 201 tracks", () => {
    expect(RUNBOOK_TRACKS.map((track) => track.id)).toEqual(["101", "201"]);

    const track101 = RUNBOOK_TRACKS.find((track) => track.id === "101");
    const track201 = RUNBOOK_TRACKS.find((track) => track.id === "201");

    expect(track101?.description).toBe(
      "You will explore different ways to work in Grok Build, use modes and models for the right tasks, apply rules and skills to ensure consistent quality, and complete at least one task with an agent.",
    );
    expect(track201?.description).toBe(
      "You will curate what belongs in an agent's context, encode conventions as project skills, connect a curated set of MCP servers, and split one task across parallel agents.",
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
      "Ask Grok Build to create a slideshow in Figma using MCP Servers. Find a MCP server for slideshow generation in Grok Build. Go to Customize > MCPs > Figma.",
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
      "How do I work with an agent?",
      "How do I govern my agent?",
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
      "What is the agent doing to manage context?",
      "How do I standardize agent behavior?",
      "How does my agent get more information?",
      "How do I parallelize a task?",
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
      "Go to Agent 1 All chat. Select the Context Usage indicator below the chat. Go to Agent 2 Target. Select the Context Usage indicator below the chat.",
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
      "Promote the create-api skill so teammates can use it. Open skill in .cursor/skills. Explore the other project skills for this repository, such as add-dashboard-widget, draft-collection-email, or write-prisma-query.",
    );
    expect(beat("promote-create-api-project")?.example).toBe("Promote the create-api skill to this project.");
    expect(beat("add-linear-mcp")?.detail).toBe(
      "Let’s start the issue tracker’s MCP server (in this case, Linear) to get a ticket to this project. Review MCP servers in Customize > MCPs. Enable the Linear MCP server.",
    );
    expect(beat("add-linear-mcp")?.example).toBeUndefined();
    expect(beat("mcp-allowlist")?.promptType).toBe("none");
    expect(beat("mcp-allowlist")?.example).toBeUndefined();
    expect(beat("mcp-allowlist")?.detail).toBe(
      "Go to Settings > Agents > Execution and Approvals > Allowlist Options > MCP Allowlist to check valid MCP servers and tools from your administrator.",
    );
    expect(beat("ask-linear-bug")?.detail).toBe(
      "Open a new agent. Someone reported a bug and it was logged in our issue tracker. I want more information on it. Explore the tool calls to Linear MCP server.",
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
      "Go to Customize > Plugins. Go to Personal. Select Add to enable the “Standard bug fix” plugin. Show that the plugin has skills, rules, and MCP server.",
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

  it("does not resolve the retired advanced track", () => {
    expect(RUNBOOK_TRACKS).toHaveLength(2);
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
    // confirm counts only active issues so canceled linked extras do not fail the check
    expect(stage, "stage confirm must count only active issues").toMatch(
      /active.*non-`?Canceled`?|non-`?Canceled`?.*active/i,
    );
    expect(stage, "stage confirm must not require every linked issue to be catalog").not.toContain(
      "list_issues` on the project returns exactly the three catalog titles",
    );
  });
});
