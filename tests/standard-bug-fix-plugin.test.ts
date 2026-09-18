import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "plugins/standard-bug-fix");
const read = (relative: string) => readFileSync(join(root, relative), "utf8");

describe("standard-bug-fix disk plugin", () => {
  it("is importable from disk with marketplace and plugin manifests", () => {
    expect(existsSync(join(root, ".cursor-plugin/marketplace.json"))).toBe(true);
    expect(existsSync(join(root, ".cursor-plugin/plugin.json"))).toBe(true);

    const marketplace = JSON.parse(read(".cursor-plugin/marketplace.json")) as {
      name: string;
      plugins: { name: string; source: string }[];
    };
    const plugin = JSON.parse(read(".cursor-plugin/plugin.json")) as {
      name: string;
      mcpServers: string;
    };

    expect(marketplace.name).toBe("ledgerly-standard-bug-fix");
    expect(marketplace.plugins).toEqual([
      expect.objectContaining({ name: "standard-bug-fix", source: "./" }),
    ]);
    expect(plugin.name).toBe("standard-bug-fix");
    expect(plugin.mcpServers).toBe("./mcp.json");
  });

  it("includes Linear MCP, the standard-bug-fix skill, and the Linear writeback rule", () => {
    const mcp = JSON.parse(read("mcp.json")) as {
      mcpServers: { linear: { url: string } };
    };
    const skill = read("skills/standard-bug-fix/SKILL.md");
    const rule = read("rules/standard-bug-fix.mdc");

    expect(mcp.mcpServers.linear.url).toBe("https://mcp.linear.app/mcp");
    expect(skill).toMatch(/^---\nname: standard-bug-fix\n/m);
    expect(skill).toContain("FIELD_DEMO_ISSUES");
    expect(skill).toContain("Match `FIELD_DEMO_ISSUES` titles");
    expect(skill).not.toContain("/standard-bug-fix LY-003");
    expect(skill).toContain("Do **not** assume `LY-003` is the filter bug");
    expect(skill).toContain('`state`: `In Progress`');
    expect(skill).toContain("Do not mark the issue Done or Complete");
    expect(skill).toContain("# Bug Fix Summary: [Service affected] - [Short Description]");
    expect(skill).toContain("## 1. The Core Problem (Why it happened)");
    expect(skill).toContain("## 2. Quick Takeaways");
    expect(skill).toContain("## 3. Fixes");
    expect(rule).toContain("alwaysApply: true");
    expect(rule).toContain("https://mcp.linear.app/mcp");
    expect(rule).toContain("FIELD_DEMO_ISSUES");
    expect(rule).toContain('`state`: `In Progress`');
    expect(rule).toContain("Do not mark it Done or Complete");
    expect(rule).not.toContain("/standard-bug-fix LY-003");
    expect(rule).toContain("# Bug Fix Summary: [Service affected] - [Short Description]");
    expect(rule).toContain("## 1. The Core Problem (Why it happened)");
    expect(rule).toContain("## 2. Quick Takeaways");
    expect(rule).toContain("## 3. Fixes");
  });
});
