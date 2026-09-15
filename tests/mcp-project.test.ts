import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("project MCP map", () => {
  it("does not ship ledgerly-db or any other project MCP server", () => {
    const mcp = JSON.parse(readFileSync(join(root, ".cursor/mcp.json"), "utf8"));
    expect(mcp.mcpServers).toEqual({});
    expect(mcp.mcpServers["ledgerly-db"]).toBeUndefined();
    expect(existsSync(join(root, "mcp"))).toBe(false);
  });
});
