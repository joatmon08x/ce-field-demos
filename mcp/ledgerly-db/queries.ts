/**
 * Read-only Prisma lookups for the ledgerly-db MCP.
 * Keep money in integer cents; format with formatUsd at the edge.
 */

import { prisma } from "../../lib/prisma";
import { formatUsd } from "../../lib/money";
import { DISPUTE_STATUSES, INVOICE_STATUSES, type DisputeStatus, type InvoiceStatus } from "../../lib/status";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function clampLimit(limit?: number): number {
  if (limit === undefined) return DEFAULT_LIMIT;
  return Math.min(Math.max(1, Math.floor(limit)), MAX_LIMIT);
}

function isInvoiceStatus(value: string): value is InvoiceStatus {
  return (INVOICE_STATUSES as readonly string[]).includes(value);
}

function isDisputeStatus(value: string): value is DisputeStatus {
  return (DISPUTE_STATUSES as readonly string[]).includes(value);
}

export function describeSchema() {
  return {
    database: "prisma/dev.db (SQLite)",
    workspace: "ws_fieldnote",
    money: "integer cents; format with formatUsd",
    catalogPricesUsd: ["$49", "$99", "$249"],
    models: {
      Workspace: ["id", "name", "slug"],
      Customer: ["id", "name", "contactName", "email", "plan", "workspaceId"],
      Invoice: [
        "id",
        "number",
        "customerId",
        "plan",
        "status",
        "issuedOn",
        "dueOn",
        "totalCents",
        "collectionNote",
      ],
      InvoiceLine: ["id", "invoiceId", "description", "quantity", "unitPriceCents", "amountCents"],
      Dispute: [
        "id",
        "invoiceId",
        "status",
        "reason",
        "openedOn",
        "disputedAmountCents",
        "suggestedCreditCents",
        "reviewerNote",
      ],
    },
    invoiceStatuses: INVOICE_STATUSES,
    disputeStatuses: DISPUTE_STATUSES,
  };
}

export async function listCustomers(opts: { nameContains?: string; limit?: number } = {}) {
  const take = clampLimit(opts.limit);
  const customers = await prisma.customer.findMany({
    where: opts.nameContains
      ? { name: { contains: opts.nameContains } }
      : undefined,
    orderBy: { name: "asc" },
    take,
    select: {
      id: true,
      name: true,
      contactName: true,
      email: true,
      plan: true,
    },
  });
  return { count: customers.length, customers };
}

export async function listInvoices(opts: { status?: string; limit?: number } = {}) {
  if (opts.status && !isInvoiceStatus(opts.status)) {
    throw new Error(`Unknown invoice status "${opts.status}". Use: ${INVOICE_STATUSES.join(", ")}`);
  }
  const take = clampLimit(opts.limit);
  const invoices = await prisma.invoice.findMany({
    where: opts.status ? { status: opts.status } : undefined,
    orderBy: { number: "asc" },
    take,
    select: {
      id: true,
      number: true,
      status: true,
      plan: true,
      totalCents: true,
      dueOn: true,
      customer: { select: { id: true, name: true } },
    },
  });
  return {
    count: invoices.length,
    invoices: invoices.map((invoice) => ({
      ...invoice,
      total: formatUsd(invoice.totalCents),
      dueOn: invoice.dueOn.toISOString().slice(0, 10),
    })),
  };
}

export async function listDisputes(opts: { status?: string; limit?: number } = {}) {
  if (opts.status && !isDisputeStatus(opts.status)) {
    throw new Error(`Unknown dispute status "${opts.status}". Use: ${DISPUTE_STATUSES.join(", ")}`);
  }
  const take = clampLimit(opts.limit);
  const disputes = await prisma.dispute.findMany({
    where: opts.status ? { status: opts.status } : undefined,
    orderBy: { id: "asc" },
    take,
    select: {
      id: true,
      status: true,
      reason: true,
      disputedAmountCents: true,
      suggestedCreditCents: true,
      invoice: {
        select: {
          id: true,
          number: true,
          plan: true,
          totalCents: true,
          customer: { select: { id: true, name: true } },
        },
      },
    },
  });
  return {
    count: disputes.length,
    disputes: disputes.map((dispute) => ({
      id: dispute.id,
      status: dispute.status,
      reason: dispute.reason,
      disputedAmount: formatUsd(dispute.disputedAmountCents),
      suggestedCredit: formatUsd(dispute.suggestedCreditCents),
      disputedAmountCents: dispute.disputedAmountCents,
      suggestedCreditCents: dispute.suggestedCreditCents,
      invoice: {
        id: dispute.invoice.id,
        number: dispute.invoice.number,
        plan: dispute.invoice.plan,
        total: formatUsd(dispute.invoice.totalCents),
        customer: dispute.invoice.customer,
      },
    })),
  };
}

export async function getCustomer(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      contactName: true,
      email: true,
      plan: true,
      invoices: {
        orderBy: { issuedOn: "desc" },
        take: 8,
        select: { id: true, number: true, status: true, totalCents: true, dueOn: true },
      },
    },
  });
  if (!customer) return null;
  return {
    ...customer,
    invoices: customer.invoices.map((invoice) => ({
      ...invoice,
      total: formatUsd(invoice.totalCents),
      dueOn: invoice.dueOn.toISOString().slice(0, 10),
    })),
  };
}

export async function getInvoice(idOrNumber: string) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      OR: [{ id: idOrNumber }, { number: idOrNumber }],
    },
    include: {
      customer: { select: { id: true, name: true, contactName: true, email: true, plan: true } },
      lines: {
        select: {
          id: true,
          description: true,
          quantity: true,
          unitPriceCents: true,
          amountCents: true,
        },
      },
      disputes: {
        select: {
          id: true,
          status: true,
          disputedAmountCents: true,
          suggestedCreditCents: true,
        },
      },
    },
  });
  if (!invoice) return null;
  return {
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    plan: invoice.plan,
    issuedOn: invoice.issuedOn.toISOString().slice(0, 10),
    dueOn: invoice.dueOn.toISOString().slice(0, 10),
    paidOn: invoice.paidOn ? invoice.paidOn.toISOString().slice(0, 10) : null,
    subtotal: formatUsd(invoice.subtotalCents),
    tax: formatUsd(invoice.taxCents),
    total: formatUsd(invoice.totalCents),
    totalCents: invoice.totalCents,
    memo: invoice.memo,
    collectionNote: invoice.collectionNote,
    customer: invoice.customer,
    lines: invoice.lines.map((line) => ({
      ...line,
      unitPrice: formatUsd(line.unitPriceCents),
      amount: formatUsd(line.amountCents),
    })),
    disputes: invoice.disputes.map((dispute) => ({
      id: dispute.id,
      status: dispute.status,
      disputedAmount: formatUsd(dispute.disputedAmountCents),
      suggestedCredit: formatUsd(dispute.suggestedCreditCents),
      suggestedCreditCents: dispute.suggestedCreditCents,
    })),
  };
}

export async function getDispute(id: string) {
  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: {
      invoice: {
        select: {
          id: true,
          number: true,
          plan: true,
          status: true,
          totalCents: true,
          customer: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
  if (!dispute) return null;
  return {
    id: dispute.id,
    status: dispute.status,
    reason: dispute.reason,
    openedOn: dispute.openedOn.toISOString().slice(0, 10),
    disputedAmount: formatUsd(dispute.disputedAmountCents),
    suggestedCredit: formatUsd(dispute.suggestedCreditCents),
    disputedAmountCents: dispute.disputedAmountCents,
    suggestedCreditCents: dispute.suggestedCreditCents,
    reviewerNote: dispute.reviewerNote,
    invoice: {
      ...dispute.invoice,
      total: formatUsd(dispute.invoice.totalCents),
    },
  };
}
