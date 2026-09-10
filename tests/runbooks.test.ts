import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  RUNBOOK_SECTIONS_101,
  RUNBOOK_TRACKS,
  runbookBeatSequence,
  runbookBeats,
} from "@/lib/runbooks/meta";

const root = process.cwd();
const beats101 = runbookBeats("101");

describe("runbook catalog", () => {
  it("ships only the 101 track", () => {
    expect(RUNBOOK_TRACKS.map((track) => track.id)).toEqual(["101"]);

    const track101 = RUNBOOK_TRACKS.find((track) => track.id === "101");

    expect(track101?.description).toBe(
      "You will explore different ways to work in Cursor, use modes and models for the right tasks, apply rules and skills to ensure consistent quality, and complete at least one task with an agent.",
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

    expect(beat("ask")?.example).toBe("/ask Tell me what this application does in 3 sentences");
    expect(beat("plan")?.example).toBe(
      "/plan I want a new feature to update the customer email in the invoice detail customer card. Don’t implement email validation.",
    );
    expect(beat("agent-build")?.example).toBeUndefined();
    expect(beat("debug")?.example).toBe("/debug the failing test");
    expect(beat("model-fast")?.example).toBe("/model.");
    expect(beat("fix")?.example).toBe("/plan draft a plan to fix the bug");
    expect(beat("allowlist")?.example).toBeUndefined();
    expect(beat("allowlist")?.detail).toBe(
      "Go to Settings → Agents → Executions & Approvals → Run Mode → Allowlist.",
    );
    expect(beat("model-deep")?.example).toBe("/model");
    expect(beat("start-and-stop")?.title).toBe("Redact (partial)");
    expect(beat("start-and-stop")?.example).toBe(
      "Redact the customer email in the UI. The first two characters and domain are plaintext.",
    );
    expect(beat("stop")?.example).toBeUndefined();
    expect(beat("stop")?.detail).toBe("Stop the prompt with the Stop button.");
    expect(beat("interrupt-steer")?.example).toBe(
      "Redact the customer email in the UI. Show it in plaintext if I click an icon. Stop every time you change a file for me to review.",
    );
    expect(beat("diffs")?.example).toBeUndefined();
    expect(beat("rule")?.example).toBe(
      "/create-rule New features should use the new API instead of the legacy API. This is a personal rule.",
    );
    expect(beat("test-rule")?.example).toBe(
      "Add a new feature to show the current cap for dispute credit. Make clear which API you’re referencing.",
    );
    expect(beat("skill")?.example).toBe(
      "/create-skill Use domain-driven design to break down the domains in this application and match it to available APIs or data schemas. This is a personal skill.",
    );
    expect(beat("test-skill")?.example).toBe("Use domain-driven design on this application. Do not edit files.");
    expect(beat("canvas")?.title).toBe("Canvas");
    expect(beat("canvas")?.example).toBe("Create a canvas explaining what we did today.");
    expect(beat("mcp")?.title).toBe("MCP / Figma");
    expect(beat("mcp")?.detail).toContain("Customize > MCP > Figma");
    expect(beat("mcp")?.example).toContain("Figma Slides");

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
  });

  it("no longer resolves the retired 201 and advanced tracks", () => {
    expect(RUNBOOK_TRACKS).toHaveLength(1);
    for (const retired of ["201", "advanced", "Advanced"]) {
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

  it("points docs, skills, and rules at /runbooks and drops the retired tracks", () => {
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
      expect(contents, `${name} still references a retired 201 track`).not.toMatch(
        /\b201\b/,
      );
      expect(contents, `${name} still references a retired Advanced track`).not.toMatch(
        /Advanced track/,
      );
    }

    expect(files.readme).toContain("/runbooks");
    expect(files.agents).toContain("lib/runbooks/meta.ts");
    expect(files.rule).toContain("lib/runbooks/meta.ts");
    expect(files.skill).toContain("lib/runbooks/meta.ts");
    expect(files.cloud).toContain("Cloud Agent");
    expect(files.reset).toContain("1 failed / 31 passed");
  });
});
