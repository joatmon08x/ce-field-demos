import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  describeSchema,
  getDispute,
  getInvoice,
  listDisputes,
  listInvoices,
} from "../mcp/ledgerly-db/queries";
import { PLAN_PRICE_CENTS } from "@/lib/plans";

describe("ledgerly-db MCP queries", () => {
  it("describes the book schema and catalog constraints", () => {
    const schema = describeSchema();
    expect(schema.workspace).toBe("ws_fieldnote");
    expect(schema.catalogPricesUsd).toEqual(["$49", "$99", "$249"]);
    expect(schema.models.Dispute).toContain("suggestedCreditCents");
  });

  it("lists overdue invoices with dollar totals", async () => {
    const result = await listInvoices({ status: "OVERDUE" });
    expect(result.count).toBeGreaterThan(0);
    expect(result.invoices.every((invoice) => invoice.status === "OVERDUE")).toBe(true);
    expect(result.invoices[0]?.total).toMatch(/^\$/);
  });

  it("fetches dsp_1043 with the catalog-capped stored credit", async () => {
    const dispute = await getDispute("dsp_1043");
    expect(dispute).not.toBeNull();
    expect(dispute!.suggestedCreditCents).toBe(PLAN_PRICE_CENTS.SCALE);
    expect(dispute!.suggestedCredit).toBe("$249.00");
    expect(dispute!.invoice.plan).toBe("SCALE");
  });

  it("fetches INV-1043 by number", async () => {
    const invoice = await getInvoice("INV-1043");
    expect(invoice).not.toBeNull();
    expect(invoice!.id).toBe("inv_1043");
    expect(invoice!.plan).toBe("SCALE");
  });

  it("lists open and needs-review disputes", async () => {
    const open = await listDisputes({ status: "OPEN" });
    const review = await listDisputes({ status: "NEEDS_REVIEW" });
    expect(open.count + review.count).toBeGreaterThan(0);
  });

  it("wires ledgerly-db into .cursor/mcp.json", () => {
    const mcp = JSON.parse(readFileSync(join(process.cwd(), ".cursor/mcp.json"), "utf8"));
    expect(mcp.mcpServers["ledgerly-db"]).toEqual({
      command: "npx",
      args: ["tsx", "mcp/ledgerly-db/server.ts"],
    });
  });
});
