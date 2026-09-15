/**
 * Local stdio MCP for CompanyTicket — mock JIRA for Fieldnote Workspace.
 * Read-only mock backlog. Ticket keys use the LY-000 scheme.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  describeProject,
  getTicket,
  listBacklog,
  listSprintBoard,
  listSprints,
  listTickets,
  searchTickets,
} from "../../lib/companyticket/tickets";

function textResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function notFound(kind: string, id: string) {
  return {
    content: [{ type: "text" as const, text: `${kind} not found: ${id}` }],
    isError: true as const,
  };
}

export function createCompanyTicketServer(): McpServer {
  const server = new McpServer({
    name: "companyticket",
    version: "1.0.0",
  });

  server.registerTool(
    "describe_project",
    {
      description:
        "Describe the CompanyTicket project (key LY, scheme LY-000), statuses, and available tools. Call this first.",
    },
    async () => textResult(describeProject()),
  );

  server.registerTool(
    "list_sprints",
    {
      description: "List CompanyTicket sprints. The active sprint is Fieldnote 26.8 (spr_268).",
    },
    async () => textResult(listSprints()),
  );

  server.registerTool(
    "list_tickets",
    {
      description:
        "List CompanyTicket issues. Filter by sprintId (spr_268 or none for backlog), status (Backlog|To Do|In Progress|Done), or type (Story|Bug|Task).",
      inputSchema: {
        sprintId: z
          .string()
          .optional()
          .describe("Sprint id (spr_268) or 'none' for issues not on a sprint"),
        status: z.string().optional().describe("Ticket status"),
        type: z.string().optional().describe("Story, Bug, or Task"),
      },
    },
    async ({ sprintId, status, type }) => textResult(listTickets({ sprintId, status, type })),
  );

  server.registerTool(
    "get_ticket",
    {
      description:
        "Fetch one issue by key (LY-001, LY-002, LY-003). Keys use the LY-000 scheme. Includes description, acceptance, Ledgerly paths, and comments.",
      inputSchema: {
        key: z.string().describe("Ticket key, e.g. LY-002"),
      },
    },
    async ({ key }) => {
      const ticket = getTicket(key);
      return ticket ? textResult(ticket) : notFound("Ticket", key);
    },
  );

  server.registerTool(
    "search_tickets",
    {
      description: "Search CompanyTicket issues by key, title, label, or path (e.g. dsp_1043, Overdue, invoice).",
      inputSchema: {
        query: z.string().describe("Free-text query"),
      },
    },
    async ({ query }) => textResult(searchTickets(query)),
  );

  server.registerTool(
    "get_board",
    {
      description:
        "Return the sprint board columns (To Do, In Progress, Done) plus the backlog. Default sprint is the active Fieldnote 26.8 sprint.",
      inputSchema: {
        sprintId: z.string().optional().describe("Sprint id (default: active)"),
      },
    },
    async ({ sprintId }) => {
      const board = listSprintBoard(sprintId);
      if (!board) return notFound("Sprint", sprintId ?? "active");
      return textResult({ ...board, backlog: listBacklog() });
    },
  );

  return server;
}

async function main() {
  const server = createCompanyTicketServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("companyticket MCP listening on stdio (read-only mock JIRA)");
}

const isDirectRun =
  process.argv[1]?.endsWith("mcp/companyticket/server.ts") ||
  process.argv[1]?.endsWith("mcp/companyticket/server.js") ||
  process.argv[1]?.endsWith("plugin/companyticket/mcp/server.ts");

if (isDirectRun) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
