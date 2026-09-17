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
      "You will curate what belongs in an agent's context, encode conventions as project skills and hooks, connect a curated set of MCP servers, and split one task across parallel agents.",
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
      "Ask → Plan → Build in Agent mode → Debug → Change to a fast model → Plan to fix the bug → Run Mode Allowlist → Redact (partial) → Stop the prompt → Interrupt and steer → Review diffs → Restore from a checkpoint → Create a user rule → Test the rule → Create a user skill → Test the skill → Canvas → MCP / Figma",
    );

    expect(beats101.map((beat) => beat.id)).toEqual([
      "ask",
      "plan",
      "agent-build",
      "debug",
      "model-fast",
      "fix",
      "allowlist",
      "start-and-stop",
      "stop",
      "interrupt-steer",
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
    expect(beat("debug")?.detail).toBe("Fix the bug using Debug mode.");
    expect(beat("debug")?.example).toBe("/debug the failing test");
    expect(beat("model-fast")?.detail).toBe(
      "Change to a fast model for a small update. Change model from Auto to Fast.",
    );
    expect(beat("model-fast")?.example).toBe("/model.");
    expect(beat("fix")?.detail).toBe("Use shift-tab to toggle between modes.");
    expect(beat("fix")?.example).toBe("/plan draft a plan to fix the bug");
    expect(beat("allowlist")?.example).toBeUndefined();
    expect(beat("allowlist")?.detail).toBe(
      "Let’s change how our agent asks for approvals by configuring an allowlist - a known set of commands that Grok Build can run without asking for review. Go to Settings -> Agents -> Executions & Approvals -> Run Mode -> Allowlist.",
    );
    expect(beat("start-and-stop")?.title).toBe("Redact (partial)");
    expect(beat("start-and-stop")?.detail).toBe("");
    expect(beat("start-and-stop")?.example).toBe(
      "Redact the customer email in the UI. The first two characters and domain are plaintext.",
    );
    expect(beat("stop")?.example).toBeUndefined();
    expect(beat("stop")?.detail).toBe("Stop the prompt with the Stop button.");
    expect(beat("interrupt-steer")?.example).toBe(
      "Redact the customer email in the UI. Show it in plaintext if I click an icon. Stop every time you change a file for me to review.",
    );
    expect(beat("diffs")?.example).toBeUndefined();
    expect(beat("checkpoint-restore")?.title).toBe("Restore from a checkpoint");
    expect(beat("checkpoint-restore")?.promptType).toBe("none");
    expect(beat("checkpoint-restore")?.example).toBeUndefined();
    expect(beat("checkpoint-restore")?.detail).toBe(
      "If I want to revert the code, I can restore from a checkpoint. Scroll back to a prompt before updating the feature. Select the restore icon next to the prompt.",
    );
    expect(beat("rule")?.detail).toBe(
      "Let’s create a user rule so the agent doesn’t try to improve the invoice schema without our approval. Go to Customize -> Rules -> User to edit the rule.",
    );
    expect(beat("rule")?.example).toBe(
      "/create-rule Preserve the invoice view. Do not rename, restyle, or rearrange invoice screens unless the user names the **exact** new copy (or a specific layout change). This is a personal rule. Show me the rule so I can copy it manually.",
    );
    expect(beat("test-rule")?.detail).toBe("");
    expect(beat("test-rule")?.example).toBe('Change "Line Items" in the UI to something else.');
    expect(beat("skill")?.detail).toBe(
      "Let’s create a user skill that tells me the domain breakdown and available APIs. Go to Customize -> Skills to view the skill.",
    );
    expect(beat("skill")?.example).toBe(
      "/create-skill Use domain-driven design to break down the domains in this application and match it to available APIs or data schemas. This is a personal skill.",
    );
    expect(beat("test-skill")?.detail).toBe("");
    expect(beat("test-skill")?.example).toBe("Use domain-driven design on this application. Do not edit files.");
    expect(beat("canvas")?.title).toBe("Canvas");
    expect(beat("canvas")?.example).toBe("Create a canvas explaining what we did today.");
    expect(beat("mcp")?.title).toBe("MCP / Figma");
    expect(beat("mcp")?.detail).toContain("Customize > MCPs > Figma");
    expect(beat("mcp")?.example).toContain("Figma Slides");

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
      "start-and-stop",
      "stop",
      "interrupt-steer",
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
      "Why is my agent ignoring my instructions?",
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
      "compare-agents",
      "ask-cross-context",
      "context-usage",
      "create-api-personal-skill",
      "promote-create-api-project",
      "show-money-hook",
      "show-money-script",
      "bypass-formatter-test",
      "add-linear-mcp",
      "mcp-allowlist",
      "ask-linear-bug",
      "add-local-plugin",
      "check-plugin",
      "standard-bug-fix",
      "open-resolve-dispute-plan",
      "open-ledgerly-reviewer",
      "open-dispatch-subagents-skill",
      "multitask-resolve-dispute",
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
    expect(beat("ask-ddd-all")?.detail).toBe("Ask the all-codebase agent for domain-driven design.");
    expect(beat("ask-ddd-all")?.example).toBe(
      "/ask what is the domain driven design of the application.",
    );
    expect(beat("rename-agent-2-target")?.detail).toBe(
      "Open a second agent for a new targeted context window.",
    );
    expect(beat("rename-agent-2-target")?.example).toBe("/rename-chat Agent 2 Target");
    expect(beat("ask-ddd-invoice-table")?.detail).toBe(
      "Ask for domain-driven design of the invoice table only.",
    );
    expect(beat("ask-ddd-invoice-table")?.example).toBe(
      "/ask what is the domain driven design of the @invoice-table.tsx",
    );
    expect(beat("compare-agents")?.promptType).toBe("none");
    expect(beat("compare-agents")?.example).toBeUndefined();
    expect(beat("compare-agents")?.detail).toBe(
      "Agent 1 maps all the domains in the whole codebase. Agent 2 maps half of the domains based on the targeted context.",
    );
    expect(beat("ask-cross-context")?.detail).toBe(
      "Agent 1 mapped all domains; Agent 2 can reuse that summary. Go to Agent 2 Target chat.",
    );
    expect(beat("ask-cross-context")?.example).toBe(
      "/ask @Agent 1 All Does refactoring the table change anything across all contexts?",
    );
    expect(beat("context-usage")?.promptType).toBe("none");
    expect(beat("context-usage")?.detail).toBe("Select the Context Usage indicator below the chat.");
    expect(beat("context-usage")?.example).toBeUndefined();
    expect(beat("create-api-personal-skill")?.detail).toBe(
      "Open a new agent. It scans the entire repository for the pattern. Create a personal skill for how to create a new API. Open skill in ~/.cursor/skills.",
    );
    expect(beat("create-api-personal-skill")?.example).toBe(
      "/create-skill for how to create a new API. Follow the standards in this repo. This is a personal skill named create-api.",
    );
    expect(beat("promote-create-api-project")?.detail).toBe(
      "Promote the create-api skill so teammates can use it. Open skill in .cursor/skills. Explore the other project skills for this repository.",
    );
    expect(beat("promote-create-api-project")?.example).toBe("Promote the create-api skill to this project.");
    expect(beat("show-money-hook")?.promptType).toBe("none");
    expect(beat("show-money-hook")?.example).toBeUndefined();
    expect(beat("show-money-hook")?.detail).toBe(
      "Open .cursor/hooks.json. Review the hook to fix money-formatted fields.",
    );
    expect(beat("show-money-script")?.promptType).toBe("none");
    expect(beat("show-money-script")?.example).toBeUndefined();
    expect(beat("show-money-script")?.detail).toBe(
      "Open hooks/check-money-formatting.mjs. Review the script that always enforces ESLint.",
    );
    expect(beat("bypass-formatter-test")?.detail).toBe(
      "Open app/disputes/[id]/page.tsx. The agent runs the hook and recognizes unsafe formatting.",
    );
    expect(beat("bypass-formatter-test")?.example).toBe(
      'In app/disputes/[id]/page.tsx, uncomment the local `let capUsd = "$" + (catalogPrice / 100).toFixed(2)` and use capUsd in the Resolution CardDescription.',
    );
    const disputePage = readFileSync(join(root, "app/disputes/[id]/page.tsx"), "utf8");
    expect(disputePage).toContain(
      '// let capUsd = "$" + (catalogPrice / 100).toFixed(2);',
    );
    expect(disputePage).toContain("{/* capUsd */ formatUsd(catalogPrice)}");
    expect(disputePage).not.toMatch(/^\s*let capUsd = /m);
    expect(beat("add-linear-mcp")?.detail).toBe(
      "Check MCP servers in Customize -> MCPs. Review the Linear MCP server and the different tools you can enable.",
    );
    expect(beat("add-linear-mcp")?.example).toBe("Add the Linear MCP server to this project.");
    expect(beat("mcp-allowlist")?.promptType).toBe("none");
    expect(beat("mcp-allowlist")?.example).toBeUndefined();
    expect(beat("mcp-allowlist")?.detail).toBe(
      "Go to Settings -> Agents -> Execution and Approvals -> Allowlist Options -> MCP Allowlist to check valid MCP servers and tools from your administrator.",
    );
    expect(beat("ask-linear-bug")?.detail).toBe("Explore the tool calls to Linear MCP server.");
    expect(beat("ask-linear-bug")?.example).toBe(
      "/ask “Overdue / Needs review filter does not change the list”",
    );
    expect(beat("add-local-plugin")?.promptType).toBe("none");
    expect(beat("add-local-plugin")?.example).toBeUndefined();
    expect(beat("add-local-plugin")?.detail).toBe(
      "A teammate created a plugin for standardizing bug fixes. Go to Customize -> Plugins -> Add -> From Local Repository. Find the plugins/standard-bug-fix file directory and add it.",
    );
    expect(beat("check-plugin")?.promptType).toBe("none");
    expect(beat("check-plugin")?.example).toBeUndefined();
    expect(beat("check-plugin")?.detail).toBe(
      "Go to Customize -> Plugins. Add the “Standard bug fix” plugin. Show that the plugin has skills, rules, and MCP server. Select Manage. Review standard bug fix plugin. It has the Linear MCP server, skills, and rules.",
    );
    expect(beat("standard-bug-fix")?.detail).toBe(
      "Let’s fix the bug and update the issue with the standard template. Go to the issue in Linear and review the comments following the bug template.",
    );
    expect(beat("standard-bug-fix")?.example).toBe(
      "/standard-bug-fix “Overdue / Needs review filter does not change the list”",
    );
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
    expect(beat("ledgerly-reviewer-check")?.detail).toBe("");
    expect(beat("ledgerly-reviewer-check")?.example).toBe("ledgerly-reviewer check my work");

    expect(beats201.every((entry) => entry.promptType !== undefined)).toBe(true);
    expect(beat("rename-agent-1-all")?.promptType).toBe("reusable");
    expect(beat("ask-ddd-all")?.promptType).toBe("reusable");
    expect(beat("rename-agent-2-target")?.promptType).toBe("reusable");
    expect(beat("ask-ddd-invoice-table")?.promptType).toBe("reusable");
    expect(beat("ask-cross-context")?.promptType).toBe("reusable");
    expect(beat("context-usage")?.promptType).toBe("none");
    expect(beat("create-api-personal-skill")?.promptType).toBe("reusable");
    expect(beat("promote-create-api-project")?.promptType).toBe("reusable");
    expect(beat("bypass-formatter-test")?.promptType).toBe("adaptable");
    expect(beat("add-linear-mcp")?.promptType).toBe("adaptable");
    expect(beat("ask-linear-bug")?.promptType).toBe("adaptable");
    expect(beat("standard-bug-fix")?.promptType).toBe("adaptable");
    expect(beat("multitask-resolve-dispute")?.promptType).toBe("reusable");
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
    expect(files.reset).toContain("1 failed / 29 passed");
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
});
