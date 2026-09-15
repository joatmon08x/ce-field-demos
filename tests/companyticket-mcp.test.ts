import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createCompanyTicketServer } from "../mcp/companyticket/server";

function parseToolJson(result: { content: unknown; isError?: boolean }) {
  const content = result.content;
  if (!Array.isArray(content) || typeof content[0]?.text !== "string") {
    throw new Error("unexpected MCP tool result");
  }
  const text = content[0].text as string;
  const isError = result.isError === true;
  let json: unknown = null;
  if (!isError) {
    json = JSON.parse(text);
  }
  return { text, isError, json };
}

describe("companyticket MCP server", () => {
  let client: Client;

  beforeEach(async () => {
    const server = createCompanyTicketServer();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: "companyticket-test", version: "1.0.0" });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  });

  afterEach(async () => {
    await client.close();
  });

  it("registers the six ticket tools", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name)).toEqual([
      "describe_project",
      "list_sprints",
      "list_tickets",
      "get_ticket",
      "search_tickets",
      "get_board",
    ]);
  });

  it("returns LY-002 from get_ticket", async () => {
    const result = await client.callTool({ name: "get_ticket", arguments: { key: "LY-002" } });
    const { json, isError } = parseToolJson(result);
    expect(isError).toBe(false);
    expect(json).toMatchObject({
      key: "LY-002",
    });
    expect((json as { summary: string }).summary).toContain("$400");
    expect((json as { summary: string }).summary).toContain("$249");
  });

  it("errors when get_ticket misses a key", async () => {
    const result = await client.callTool({ name: "get_ticket", arguments: { key: "LY-999" } });
    const { text, isError } = parseToolJson(result);
    expect(isError).toBe(true);
    expect(text).toBe("Ticket not found: LY-999");
  });

  it("returns the Fieldnote 26.8 board from get_board", async () => {
    const result = await client.callTool({ name: "get_board", arguments: {} });
    const { json, isError } = parseToolJson(result);
    expect(isError).toBe(false);
    expect(json).toMatchObject({
      sprint: { name: "Fieldnote 26.8" },
    });
    const board = json as {
      columns: { status: string }[];
      backlog: { tickets: { key: string }[] };
    };
    expect(board.columns.map((column) => column.status)).toEqual(["To Do", "In Progress", "Done"]);
    expect(board.backlog.tickets.map((ticket) => ticket.key)).toEqual(["LY-004", "LY-005"]);
  });
});
