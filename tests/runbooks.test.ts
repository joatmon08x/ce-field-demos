import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  RUNBOOKS,
  RUNBOOK_SECTIONS_101,
  RUNBOOK_SECTIONS_201,
  RUNBOOK_SECTIONS_ADVANCED,
  RUNBOOK_TRACKS,
  runbookBeatSequence,
  runbookBeats,
} from "@/lib/runbooks/meta";
import { getActiveBrand } from "@/lib/brand";

const root = process.cwd();
const beats101 = runbookBeats("101");

describe("runbook catalog split", () => {
  it("keeps README prompts and howto demo prompts in sync with metadata", () => {
    const readme = readFileSync(join(root, "README.md"), "utf8");
    const howto = readFileSync(join(root, "demo-howto.md"), "utf8");
    for (const runbook of RUNBOOKS) {
      expect(
        howto,
        `demo-howto.md is missing the ${runbook.slug} demo prompt from lib/runbooks/meta.ts`,
      ).toContain(runbook.demoPrompt);
      expect(runbook.demoPrompt).toContain("lib/runbooks/meta.ts");
      expect(runbook.demoPrompt).toContain(runbook.slug);
    }

    expect(readme).toContain("Start the Medly application");
    expect(readme).toContain("SaaSly");
    expect(readme).toContain("Routely");
    expect(readme).toContain("/runbooks");

    const track101 = RUNBOOK_TRACKS.find((track) => track.id === "101");
    const track201 = RUNBOOK_TRACKS.find((track) => track.id === "201");
    const advanced = RUNBOOK_TRACKS.find((track) => track.id === "advanced");

    expect(track101?.runbookSlugs).toEqual([]);
    expect(track101?.description).toBe(
      "You will explore different ways to work in Cursor, use modes and models for the right tasks, apply rules and skills to ensure consistent quality, and complete at least one task with an agent.",
    );
    expect(track201?.runbookSlugs).toEqual(["multitask", "loop", "autopilot", "orchestrate"]);
    expect(advanced?.runbookSlugs).toContain("goal");
    expect(track101?.runbookSlugs).not.toContain("goal");
    expect(track201?.runbookSlugs).not.toContain("goal");

    for (const runbook of RUNBOOKS) {
      const expectedTracks = RUNBOOK_TRACKS.filter((track) =>
        track.runbookSlugs.some((slug) => slug === runbook.slug),
      ).map((track) => track.id);
      expect(runbook.tracks).toEqual(expectedTracks);
    }

    const autopilot = RUNBOOKS.find((runbook) => runbook.slug === "autopilot");

    expect(autopilot?.command).toBe("/autopilot");
    expect(autopilot?.prompt.startsWith("/autopilot")).toBe(true);
    expect(autopilot?.prompt).not.toContain("/goal");
    expect(autopilot?.blurb).toContain("/babysit");

    const skill = readFileSync(join(root, ".cursor/skills/choose-cursor-workflow/SKILL.md"), "utf8");
    expect(skill).toContain(track101?.description ?? "");
    expect(runbookBeatSequence("101")).toBe(
      "Ask → Plan → Build in Agent mode → Debug → Change to a fast model → Plan to fix the bug → Run Mode Allowlist → Change to a deep / intelligent model → Redact (partial) → Stop the prompt → Interrupt and steer → Review diffs → Create a user rule → Test the rule → Create a user skill → Test the skill → Canvas → MCP / Figma",
    );

    expect(beats101.map((beat) => beat.id)).toEqual([
      "ask",
      "plan",
      "agent-build",
      "debug",
      "model-fast",
      "fix",
      "allowlist",
      "model-deep",
      "start-and-stop",
      "stop",
      "interrupt-steer",
      "diffs",
      "rule",
      "test-rule",
      "skill",
      "test-skill",
      "canvas",
      "mcp",
    ]);

    const beat = (id: (typeof beats101)[number]["id"]) => beats101.find((entry) => entry.id === id);

    const examples = getActiveBrand().runbookExamples;

    expect(beat("ask")?.example).toBe("/ask Tell me what this application does in 3 sentences");
    expect(beat("plan")?.example).toBe(examples.plan);
    expect(beat("agent-build")?.example).toBeUndefined();
    expect(beat("debug")?.example).toBe("/debug the failing test");
    expect(beat("model-fast")?.example).toBe(examples["model-fast"]);
    expect(beat("fix")?.example).toBe(examples.fix);
    expect(beat("allowlist")?.example).toBeUndefined();
    expect(beat("allowlist")?.detail).toBe(
      "Go to Settings → Agents → Executions & Approvals → Run Mode → Allowlist.",
    );
    expect(beat("model-deep")?.example).toBe("/model");
    expect(beat("start-and-stop")?.title).toBe("Redact (partial)");
    expect(beat("start-and-stop")?.example).toBe(examples["start-and-stop"]);
    expect(beat("stop")?.example).toBeUndefined();
    expect(beat("stop")?.detail).toBe("Stop the prompt with the Stop button.");
    expect(beat("interrupt-steer")?.example).toBe(examples["interrupt-steer"]);
    expect(beat("diffs")?.example).toBeUndefined();
    expect(beat("rule")?.example).toBe(examples.rule);
    expect(beat("test-rule")?.example).toBe(examples["test-rule"]);
    expect(beat("skill")?.example).toBe(examples.skill);
    expect(beat("test-skill")?.example).toBe(examples["test-skill"]);
    expect(beat("canvas")?.title).toBe("Canvas");
    expect(beat("canvas")?.example).toBe("Create a canvas explaining what we did today.");
    expect(beat("mcp")?.title).toBe("MCP / Figma");
    expect(beat("mcp")?.detail).toContain("Customize > MCP > Figma");
    expect(beat("mcp")?.example).toBe(examples.mcp);

    expect(beats101.every((entry) => entry.promptType !== undefined)).toBe(true);
    expect(beat("ask")?.promptType).toBe("reusable");
    expect(beat("plan")?.promptType).toBe("adaptable");
    expect(beat("agent-build")?.promptType).toBe("none");
    expect(RUNBOOK_SECTIONS_101.map((section) => section.title)).toEqual([
      "How do I write my first prompt?",
      "How do I work with an AI agent?",
      "How do I govern my agent?",
    ]);
    expect(RUNBOOK_SECTIONS_101.flatMap((section) => section.beats.map((entry) => entry.id))).toEqual(
      beats101.map((entry) => entry.id),
    );

    const loop = RUNBOOKS.find((runbook) => runbook.slug === "loop");

    expect(loop?.prompt.startsWith("/loop")).toBe(true);
    expect(loop?.prompt).toContain("POST http://127.0.0.1:43173/api/demo/job");
    expect(autopilot?.prompt).toContain("no open pull request");
  });

  it("gives each track its own section file with unique ids", () => {
    expect(RUNBOOK_SECTIONS_201.map((section) => section.id)).toEqual([
      "getting-oriented",
      "customize-agent",
      "model-selection",
      "cloud-agents",
      "automations",
      "trust-and-verification",
    ]);
    expect(RUNBOOK_SECTIONS_ADVANCED.map((section) => section.id)).toEqual(["cursor-cli-primer"]);

    for (const track of RUNBOOK_TRACKS) {
      const sectionIds = track.sections.map((section) => section.id);
      expect(sectionIds).toEqual([...new Set(sectionIds)]);
      for (const section of track.sections) {
        expect(section.title).not.toMatch(/^Demo \d+$/);
      }
    }
  });

  it("points docs, skills, and rules at /runbooks instead of the retired catalog", () => {
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
    }

    expect(files.readme).toContain("/runbooks");
    expect(files.howto).toContain("/runbooks/commands/");
    expect(files.howto).not.toContain("http://127.0.0.1:43173/workflows");
    expect(files.howto).not.toContain("`/workflows/");
    expect(files.agents).toContain("lib/runbooks/meta.ts");
    expect(files.rule).toContain("lib/runbooks/meta.ts");
    expect(files.skill).toContain("lib/runbooks/meta.ts");
    expect(files.cloud).toContain("lib/runbooks/meta.ts");
    expect(files.reset).toContain("1 failed / 35 passed");
  });
});
