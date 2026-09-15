/**
 * Plugin entry for CompanyTicket MCP. Same tools as mcp/companyticket/server.ts.
 * Import this plugin from disk at plugin/companyticket.
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createCompanyTicketServer } from "../../../mcp/companyticket/server";

export { createCompanyTicketServer };

async function main() {
  const server = createCompanyTicketServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("companyticket MCP listening on stdio (plugin entry)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
