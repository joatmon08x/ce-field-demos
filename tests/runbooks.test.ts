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
      "If I want to revert the code, I can restore from a checkpoint. Scroll back to a prompt before updating the feature. Click on the restore icon next to the prompt.",
    );
    expect(beat("rule")?.detail).toBe(
      "Let’s create a user rule so the agent doesn’t try to improve the invoice schema without our approval. Go to Customize -> Rules to view the rule.",
    );
    expect(beat("rule")?.example).toBe(
      "/create-rule Preserve the invoice view. Do not rename, restyle, or rearrange invoice screens unless the user names the **exact** new copy (or a specific layout change). This is a personal rule.",
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
      "canvas-all-domains",
      "rename-agent-2-invoices",
      "canvas-invoice-table",
      "ask-cross-context",
      "context-usage",
      "create-api-personal-skill",
      "promote-create-api-project",
      "create-eslint-rule",
      "test-eslint-hook",
      "add-linear-mcp",
      "fix-linear-suggested-credit",
      "import-marketplace-plugin",
      "standard-bug-fix-filter",
      "refine-plan-three-worktrees",
      "multitask-three-workstreams",
      "verify-parallel-work",
      "best-of-n-release-note",
    ]);
    expect(RUNBOOK_SECTIONS_201.flatMap((section) => section.beats.map((entry) => entry.id))).toEqual(
      beats201.map((entry) => entry.id),
    );

    const beat = (id: (typeof beats201)[number]["id"]) => beats201.find((entry) => entry.id === id);

    expect(beat("rename-agent-1-all")?.detail).toBe(
      "Open one agent and ask it for information about the entire codebase.",
    );
    expect(beat("rename-agent-1-all")?.example).toBe("/rename-chat Agent 1 All");
    expect(beat("canvas-all-domains")?.example).toBe(
      "Show me the domain driven design of the application in Canvas.",
    );
    expect(beat("rename-agent-2-invoices")?.example).toBe("/rename-chat Agent 2 Invoices");
    expect(beat("canvas-invoice-table")?.example).toBe(
      "Show me the domain driven design of @invoice-table.tsx in Canvas.",
    );
    expect(beat("ask-cross-context")?.example).toBe(
      "/ask @Agent 1 All Does refactoring the table change anything across all contexts?",
    );
    expect(beat("context-usage")?.promptType).toBe("none");
    expect(beat("context-usage")?.detail).toBe("Click on the Context Usage indicator below the chat.");
    expect(beat("context-usage")?.example).toBeUndefined();
    expect(beat("create-api-personal-skill")?.detail).toContain("Open skill in ~/.cursor/skills.");
    expect(beat("create-api-personal-skill")?.example).toBe(
      "/create-skill for how to create a new API. Follow the standards in this repo. This is a personal skill named create-api.",
    );
    expect(beat("promote-create-api-project")?.detail).toContain("Open skill in .cursor/skills");
    expect(beat("promote-create-api-project")?.example).toBe("Promote the create-api skill to this project.");
    expect(beat("create-eslint-rule")?.detail).toBe(
      "Use a linter hook instead of a long TypeScript formatting rule. Show hook in .cursor/hooks.json. Show script in hooks/eslint-changed.sh. Open app/disputes/[id]/page.tsx.",
    );
    expect(beat("create-eslint-rule")?.example).toBe(
      "/create-rule After editing .ts / .tsx files, leave them ESLint-clean. Do not add eslint-disable to silence new issues. Prefer fixing the code. The afterFileEdit hook runs ESLint on the file you changed.",
    );
    expect(beat("test-eslint-hook")?.detail).toBe("");
    expect(beat("test-eslint-hook")?.example).toBe(
      "In app/disputes/[id]/page.tsx, add a local `let capUsd = formatUsd(catalogPrice)` and use capUsd in the Resolution CardDescription instead of calling formatUsd(catalogPrice) inline. Do not run eslint or prettier. Do not enable Accept or Decline. Do not change behavior otherwise.",
    );
    expect(beat("add-linear-mcp")?.detail).toContain("Show MCP servers in Customize -> MCPs");
    expect(beat("add-linear-mcp")?.detail).toContain("Show Linear MCP and the tools you can enable.");
    expect(beat("add-linear-mcp")?.example).toBe("Add the Linear MCP server to this project.");
    expect(beat("fix-linear-suggested-credit")?.detail).toContain(
      "Explore the Linear MCP tool calls.",
    );
    expect(beat("fix-linear-suggested-credit")?.example).toBe(
      "Fix Linear issue: Dispute dsp_1043 claims $400 against a $249 Scale invoice",
    );
    expect(beat("import-marketplace-plugin")?.promptType).toBe("none");
    expect(beat("import-marketplace-plugin")?.example).toBeUndefined();
    expect(beat("import-marketplace-plugin")?.detail).toBe(
      "Go to Customize -> Browse Marketplace and add the Linear plugin if it is not already connected. Show that Linear MCP is available. Do not import CompanyTicket from disk.",
    );
    expect(beat("standard-bug-fix-filter")?.detail).toBe("");
    expect(beat("standard-bug-fix-filter")?.example).toBe(
      "/standard-bug-fix Overdue / Needs review filter does not change the list",
    );
    expect(beat("refine-plan-three-worktrees")?.example).toBe(
      "@resolve-dispute.md Refine this plan for three parallel worktree agents. Split into exactly: (1) resolve helper (2) resolve API route (3) Resolution panel UI. For each, name owned files, the shared contract, and what I’ll verify when it finishes. Keep the same thin slice. Don’t implement. Don’t touch suggested-credit client/tests, seed, or catalog prices. API must import resolveDispute — do not inline Prisma persist.",
    );
    expect(beat("multitask-three-workstreams")?.example).toBe(
      "/multitask Implement the three workstreams from this refined plan in parallel. Put each workstream in its own worktree. One agent per workstream: (1) resolve helper — only lib/disputes/resolve.ts, (2) resolve API route - only app/api/disputes/[id]/resolve/route.ts (import resolveDispute, do not inline Prisma), (3) Resolution panel UI - only the dispute detail Resolution panel (+ small client child if needed). Respect file ownership and the shared contract. Don’t touch suggested-credit client/tests, seed, or catalog prices. Mid-run 501 from the UI/API is OK until helper is applied. When all three finish, summarize each worktree’s diff and the apply order: helper → API → UI.",
    );
    expect(beat("verify-parallel-work")?.promptType).toBe("none");
    expect(beat("verify-parallel-work")?.example).toBeUndefined();
    expect(beat("verify-parallel-work")?.detail).toBe(
      "Open diffs for each agent. Check tests and linters. Open http://127.0.0.1:43173/disputes/dsp_1043. Add a reviewer note → Accept or Decline.",
    );
    expect(beat("best-of-n-release-note")?.example).toBe(
      "/best-of-n Draft a short product release note for finishing Accept/Decline on dispute resolution in Ledgerly. Audience: internal eng + CE. Include what shipped, how to verify on dsp_1043, and that suggested-credit v1→v2 is out of scope. No code changes. ~150 words.",
    );

    expect(beats201.every((entry) => entry.promptType !== undefined)).toBe(true);
    expect(beat("rename-agent-1-all")?.promptType).toBe("adaptable");
    expect(beat("context-usage")?.promptType).toBe("none");
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
    expect(files.reset).toContain("1 failed / 45 passed");
    expect(files.agents).toContain("stage-linear-201");
    expect(files.rule).toContain("stage-linear-201");
    expect(files.skill).toContain("stage-linear-201");
    expect(files.howto).toContain("stage-linear-201");
    expect(files.readme).toContain("Settings → Teams → New team");
    expect(files.readme).toContain("Make team private");
    expect(files.howto).toContain("Settings → Teams → New team");
    expect(files.howto).toContain("Make team private");
    expect(files.agents).toContain("Settings → Teams → New team");
    expect(files.agents).toContain("Make team private");
    expect(files.rule).toContain("Make team private");
    expect(files.skill).toContain("Make team private");
  });
});
