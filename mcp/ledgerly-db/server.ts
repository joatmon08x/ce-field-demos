/**
 * Local stdio MCP for Ledgerly's Prisma SQLite book.
 * Read-only — no writes, no seed edits, no catalog invention.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  describeSchema,
  getCustomer,
  getDispute,
  getInvoice,
  listCustomers,
  listDisputes,
  listInvoices,
} from "./queries";

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

export function createLedgerlyDbServer(): McpServer {
  const server = new McpServer({
    name: "ledgerly-db",
    version: "1.0.0",
  });

  server.registerTool(
    "describe_schema",
    {
      description:
        "Describe Ledgerly's Prisma models, statuses, and catalog price constraints. Call this before querying.",
    },
    async () => textResult(describeSchema()),
  );

  server.registerTool(
    "list_customers",
    {
      description: "List Fieldnote customers from the seeded book (read-only).",
      inputSchema: {
        nameContains: z.string().optional().describe("Case-sensitive substring match on customer name"),
        limit: z.number().int().min(1).max(50).optional().describe("Max rows (default 20)"),
      },
    },
    async ({ nameContains, limit }) => textResult(await listCustomers({ nameContains, limit })),
  );

  server.registerTool(
    "list_invoices",
    {
      description:
        "List invoices. Filter by status (DRAFT|OPEN|PAID|OVERDUE|VOID). Amounts include dollars and cents.",
      inputSchema: {
        status: z.string().optional().describe("Invoice status filter"),
        limit: z.number().int().min(1).max(50).optional().describe("Max rows (default 20)"),
      },
    },
    async ({ status, limit }) => textResult(await listInvoices({ status, limit })),
  );

  server.registerTool(
    "list_disputes",
    {
      description:
        "List disputes. Filter by status (OPEN|NEEDS_REVIEW|ACCEPTED|DECLINED). Includes suggested credit.",
      inputSchema: {
        status: z.string().optional().describe("Dispute status filter"),
        limit: z.number().int().min(1).max(50).optional().describe("Max rows (default 20)"),
      },
    },
    async ({ status, limit }) => textResult(await listDisputes({ status, limit })),
  );

  server.registerTool(
    "get_customer",
    {
      description: "Fetch one customer by id (e.g. cus_harborline) with recent invoices.",
      inputSchema: {
        id: z.string().describe("Customer id"),
      },
    },
    async ({ id }) => {
      const customer = await getCustomer(id);
      return customer ? textResult(customer) : notFound("Customer", id);
    },
  );

  server.registerTool(
    "get_invoice",
    {
      description: "Fetch one invoice by id (inv_1043) or number (INV-1043), with lines and disputes.",
      inputSchema: {
        idOrNumber: z.string().describe("Invoice id or INV- number"),
      },
    },
    async ({ idOrNumber }) => {
      const invoice = await getInvoice(idOrNumber);
      return invoice ? textResult(invoice) : notFound("Invoice", idOrNumber);
    },
  );

  server.registerTool(
    "get_dispute",
    {
      description:
        "Fetch one dispute by id (e.g. dsp_1043). Stored suggested credit is capped at the catalog plan price.",
      inputSchema: {
        id: z.string().describe("Dispute id"),
      },
    },
    async ({ id }) => {
      const dispute = await getDispute(id);
      return dispute ? textResult(dispute) : notFound("Dispute", id);
    },
  );

  return server;
}

async function main() {
  const server = createLedgerlyDbServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ledgerly-db MCP listening on stdio (read-only Prisma)");
}

const isDirectRun =
  process.argv[1]?.endsWith("mcp/ledgerly-db/server.ts") ||
  process.argv[1]?.endsWith("mcp/ledgerly-db/server.js");

if (isDirectRun) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
