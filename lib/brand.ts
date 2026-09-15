/**
 * Visible product identity for an industry remap.
 *
 * Technical ids stay on the original demo names: MCP `ledgerly-db`,
 * agent `ledgerly-reviewer`, skill folders like `start-ledgerly`,
 * workspace id `ws_fieldnote`, localStorage `ledgerly-theme`.
 * Runbook beat ids and copy-paste examples stay unless a prompt would
 * fail against the live UI.
 */

export const PRODUCT = {
  name: "Routerly",
  workspaceName: "Packetline Workspace",
  workspaceShort: "Packetline",
  workspaceId: "ws_fieldnote",
  workspaceSlug: "fieldnote",
  industryShort: "router and switch invoices",
  lineItemNoun: "router and switch support",
} as const;

export function monthlySupportLine(planTitleCase: string): string {
  return `${planTitleCase} plan · monthly ${PRODUCT.lineItemNoun}`;
}

export function cycleMemo(planTitleCase: string, customerName?: string, cycle = "August"): string {
  const who = customerName ? ` for ${customerName}` : "";
  return `${planTitleCase} ${PRODUCT.lineItemNoun} — ${cycle} cycle${who}.`;
}
