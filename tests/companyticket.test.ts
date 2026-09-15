import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  COMPANYTICKET_PROJECT,
  TICKETS,
  getTicket,
  listBacklog,
  listSprintBoard,
  listTickets,
  searchTickets,
} from "@/lib/companyticket/tickets";
import { PLAN_PRICE_CENTS } from "@/lib/plans";
import { formatUsd } from "@/lib/money";

const root = process.cwd();

describe("CompanyTicket mock book", () => {
  it("uses the LY-000 key scheme", () => {
    expect(COMPANYTICKET_PROJECT.keyScheme).toBe("LY-000");
    expect(TICKETS.every((ticket) => /^LY-\d{3}$/.test(ticket.key))).toBe(true);
  });

  it("puts LY-001, LY-002, and LY-003 on the active sprint", () => {
    const board = listSprintBoard();
    expect(board?.sprint.id).toBe("spr_268");
    const keys = board?.columns.flatMap((column) => column.tickets.map((ticket) => ticket.key));
    expect(keys).toEqual(["LY-001", "LY-003", "LY-002"]);
    expect(board?.columns.find((column) => column.status === "To Do")?.tickets.map((ticket) => ticket.key)).toEqual([
      "LY-001",
      "LY-003",
    ]);
    expect(board?.columns.find((column) => column.status === "In Progress")?.tickets.map((ticket) => ticket.key)).toEqual([
      "LY-002",
    ]);
  });

  it("keeps LY-001 as the invoice-detail email story", () => {
    const ticket = getTicket("ly-001");
    expect(ticket?.title.toLowerCase()).toContain("customer email");
    expect(ticket?.description).toContain("Do not implement email validation");
    expect(ticket?.sprintId).toBe("spr_268");
  });

  it("keeps LY-002 as the dsp_1043 catalog-cap bug without inventing a fourth price", () => {
    const ticket = getTicket("LY-002");
    expect(ticket?.summary).toBe("Dispute dsp_1043 claims $400 against a $249 Scale invoice.");
    expect(ticket?.description).toContain("$400");
    expect(ticket?.description).toContain("$249");
    expect(ticket?.description).not.toMatch(/\$79|\$199|enterprise/i);
    expect(formatUsd(PLAN_PRICE_CENTS.SCALE)).toBe("$249.00");
  });

  it("keeps LY-003 as the Overdue / Needs review filter bug", () => {
    const ticket = getTicket("LY-003");
    expect(ticket?.summary).toContain("http://127.0.0.1:43173/invoices");
    expect(ticket?.summary).toContain("/disputes");
    expect(ticket?.summary).toContain("Overdue / Needs review");
    expect(ticket?.summary).toContain("The list does not change. All stays highlighted.");
  });

  it("lists a separate backlog from the sprint", () => {
    const backlog = listBacklog();
    expect(backlog.tickets.map((ticket) => ticket.key)).toEqual(["LY-004", "LY-005"]);
    expect(listTickets({ sprintId: "spr_268" }).count).toBe(3);
  });

  it("searches by Ledgerly surface", () => {
    const found = searchTickets("dsp_1043");
    expect(found.tickets.map((ticket) => ticket.key)).toEqual(["LY-002"]);
  });
});

describe("CompanyTicket wiring", () => {
  it("registers the companyticket stdio MCP", () => {
    const mcp = JSON.parse(readFileSync(join(root, ".cursor/mcp.json"), "utf8"));
    expect(mcp.mcpServers.companyticket).toEqual({
      command: "npx",
      args: ["tsx", "mcp/companyticket/server.ts"],
    });
    expect(mcp.mcpServers["ledgerly-db"]).toBeUndefined();
  });

  it("ships a marketplace plugin with skill, rule, and MCP", () => {
    const plugin = JSON.parse(
      readFileSync(join(root, "plugin/companyticket/.cursor-plugin/plugin.json"), "utf8"),
    );
    expect(plugin.name).toBe("companyticket");
    expect(plugin.mcpServers).toBe("./mcp.json");
    expect(plugin.skills).toBe("./skills/");
    expect(plugin.rules).toBe("./rules/");
    const skill = readFileSync(join(root, "plugin/companyticket/skills/standard-bug-fix/SKILL.md"), "utf8");
    expect(skill).toContain("/standard-bug-fix");
    expect(skill).toContain("LY-003");
  });
});
