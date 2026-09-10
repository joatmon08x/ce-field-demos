import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { getActiveBrand } from "../lib/brand";
import { demoDay } from "../lib/clock";
import { suggestDisputeCredit } from "../lib/dispute-credit";
import { planLabel, planPriceCents } from "../lib/plans";
import { EXTRA_ACCOUNTS } from "./extra-accounts";

const prisma = new PrismaClient();

/** Invoice shape for the extra book accounts: issued Aug 1, due Aug 31 — OPEN
 * on the frozen clock — except three exception states that give the collections
 * views something to chew on without touching the original demo beats. */
function extraInvoiceState(index: number) {
  if (index === 2 || index === 8) {
    // Extra accounts at indexes 2 and 8 — overdue from the July cycle.
    return { status: "OVERDUE", issuedOn: "2026-07-05", dueOn: "2026-08-04" };
  }
  if (index % 3 === 0) {
    return { status: "PAID", issuedOn: "2026-07-20", dueOn: "2026-08-19", paidOn: "2026-08-17" };
  }
  return { status: "OPEN", issuedOn: "2026-08-01", dueOn: "2026-08-31" };
}

const brand = getActiveBrand();
const CUSTOMERS = brand.customers;

const INVOICES = [
  {
    id: "inv_1041",
    number: "INV-1041",
    customerId: "cus_harborline",
    plan: "GROWTH" as const,
    status: "OPEN",
    issuedOn: "2026-08-07",
    dueOn: "2026-09-06",
    memo: brand.invoiceMemos.inv_1041,
  },
  {
    id: "inv_1042",
    number: "INV-1042",
    customerId: "cus_cedarwell",
    plan: "STARTER" as const,
    status: "PAID",
    issuedOn: "2026-07-08",
    dueOn: "2026-08-07",
    paidOn: "2026-08-04",
    memo: brand.invoiceMemos.inv_1042,
  },
  {
    id: "inv_1043",
    number: "INV-1043",
    customerId: "cus_quarrypine",
    plan: "SCALE" as const,
    status: "OVERDUE",
    issuedOn: "2026-07-10",
    dueOn: "2026-08-09",
    memo: brand.invoiceMemos.inv_1043,
    collectionNote: "",
  },
  {
    id: "inv_1044",
    number: "INV-1044",
    customerId: "cus_brightwell",
    plan: "GROWTH" as const,
    status: "PAID",
    issuedOn: "2026-07-12",
    dueOn: "2026-08-11",
    paidOn: "2026-08-09",
    memo: brand.invoiceMemos.inv_1044,
  },
  {
    id: "inv_1045",
    number: "INV-1045",
    customerId: "cus_oakiron",
    plan: "STARTER" as const,
    status: "OPEN",
    issuedOn: "2026-08-02",
    dueOn: "2026-09-01",
    memo: brand.invoiceMemos.inv_1045,
  },
  {
    id: "inv_1046",
    number: "INV-1046",
    customerId: "cus_fieldnote",
    plan: "SCALE" as const,
    status: "PAID",
    issuedOn: "2026-07-14",
    dueOn: "2026-08-13",
    paidOn: "2026-08-12",
    memo: brand.invoiceMemos.inv_1046,
  },
  {
    id: "inv_1047",
    number: "INV-1047",
    customerId: "cus_silverpine",
    plan: "GROWTH" as const,
    status: "OVERDUE",
    issuedOn: "2026-07-13",
    dueOn: "2026-08-12",
    memo: brand.invoiceMemos.inv_1047,
  },
  {
    id: "inv_1048",
    number: "INV-1048",
    customerId: "cus_mapleember",
    plan: "STARTER" as const,
    status: "DRAFT",
    issuedOn: "2026-08-22",
    dueOn: "2026-09-21",
    memo: brand.invoiceMemos.inv_1048,
  },
  {
    id: "inv_1049",
    number: "INV-1049",
    customerId: "cus_tidewatch",
    plan: "SCALE" as const,
    status: "OPEN",
    issuedOn: "2026-08-13",
    dueOn: "2026-09-12",
    memo: brand.invoiceMemos.inv_1049,
  },
  {
    id: "inv_1050",
    number: "INV-1050",
    customerId: "cus_copperleaf",
    plan: "GROWTH" as const,
    status: "PAID",
    issuedOn: "2026-06-16",
    dueOn: "2026-07-16",
    paidOn: "2026-07-18",
    memo: brand.invoiceMemos.inv_1050,
  },
  {
    id: "inv_1051",
    number: "INV-1051",
    customerId: "cus_harborline",
    plan: "STARTER" as const,
    status: "VOID",
    issuedOn: "2026-06-07",
    dueOn: "2026-07-07",
    memo: brand.invoiceMemos.inv_1051,
  },
  {
    id: "inv_1053",
    number: "INV-1053",
    customerId: "cus_harborline",
    plan: "GROWTH" as const,
    status: "PAID",
    issuedOn: "2026-07-07",
    dueOn: "2026-08-06",
    paidOn: "2026-07-28",
    memo: brand.invoiceMemos.inv_1053,
  },
  {
    id: "inv_1054",
    number: "INV-1054",
    customerId: "cus_cedarwell",
    plan: "STARTER" as const,
    status: "PAID",
    issuedOn: "2026-07-01",
    dueOn: "2026-07-31",
    paidOn: "2026-07-25",
    memo: brand.invoiceMemos.inv_1054,
  },
  {
    id: "inv_1055",
    number: "INV-1055",
    customerId: "cus_tidewatch",
    plan: "SCALE" as const,
    status: "PAID",
    issuedOn: "2026-07-18",
    dueOn: "2026-08-17",
    paidOn: "2026-08-15",
    memo: brand.invoiceMemos.inv_1055,
  },
  {
    id: "inv_1056",
    number: "INV-1056",
    customerId: "cus_harborline",
    plan: "GROWTH" as const,
    status: "PAID",
    issuedOn: "2026-06-07",
    dueOn: "2026-07-07",
    paidOn: "2026-07-02",
    memo: brand.invoiceMemos.inv_1056,
  },
  {
    id: "inv_1057",
    number: "INV-1057",
    customerId: "cus_brightwell",
    plan: "GROWTH" as const,
    status: "PAID",
    issuedOn: "2026-08-10",
    dueOn: "2026-09-09",
    paidOn: "2026-08-18",
    memo: brand.invoiceMemos.inv_1057,
  },
  {
    id: "inv_1052",
    number: "INV-1052",
    customerId: "cus_cedarwell",
    plan: "GROWTH" as const,
    status: "OPEN",
    issuedOn: "2026-08-01",
    dueOn: "2026-08-30",
    memo: brand.invoiceMemos.inv_1052,
  },
];

const DISPUTES = [
  {
    // The $400 claim is valid input for testing the catalog cap. The deprecated
    // v1 suggested-credit API returns this claim uncapped.
    id: "dsp_1043",
    invoiceId: "inv_1043",
    status: "NEEDS_REVIEW",
    reason: brand.disputeCopy.dsp_1043.reason,
    openedOn: "2026-08-11",
    disputedAmountCents: 40000,
  },
  {
    id: "dsp_1047",
    invoiceId: "inv_1047",
    status: "OPEN",
    reason: brand.disputeCopy.dsp_1047.reason,
    openedOn: "2026-08-14",
    disputedAmountCents: 9900,
  },
  {
    id: "dsp_1049",
    invoiceId: "inv_1049",
    status: "NEEDS_REVIEW",
    reason: brand.disputeCopy.dsp_1049.reason,
    openedOn: "2026-08-18",
    disputedAmountCents: 24900,
  },
  {
    id: "dsp_1041",
    invoiceId: "inv_1041",
    status: "OPEN",
    reason: brand.disputeCopy.dsp_1041.reason,
    openedOn: "2026-08-19",
    disputedAmountCents: 9900,
  },
  {
    id: "dsp_1050",
    invoiceId: "inv_1050",
    status: "ACCEPTED",
    reason: brand.disputeCopy.dsp_1050.reason,
    openedOn: "2026-07-02",
    disputedAmountCents: 9900,
    reviewerNote: brand.disputeCopy.dsp_1050.reviewerNote,
  },
];

async function main() {
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
  });

  await prisma.dispute.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.workspace.deleteMany();

  await prisma.workspace.create({
    data: {
      id: "ws_fieldnote",
      name: brand.workspaceName,
      slug: "fieldnote",
      createdAt: demoDay("2025-11-04"),
    },
  });

  for (const customer of CUSTOMERS) {
    await prisma.customer.create({
      data: {
        ...customer,
        workspaceId: "ws_fieldnote",
        createdAt: demoDay("2026-01-15"),
      },
    });
  }

  for (const invoice of INVOICES) {
    const totalCents = planPriceCents(invoice.plan);
    await prisma.invoice.create({
      data: {
        id: invoice.id,
        number: invoice.number,
        workspaceId: "ws_fieldnote",
        customerId: invoice.customerId,
        plan: invoice.plan,
        status: invoice.status,
        issuedOn: demoDay(invoice.issuedOn),
        dueOn: demoDay(invoice.dueOn),
        paidOn: invoice.paidOn ? demoDay(invoice.paidOn) : null,
        subtotalCents: totalCents,
        taxCents: 0,
        totalCents,
        memo: invoice.memo,
        collectionNote: invoice.collectionNote ?? null,
        lines: {
          create: [
            {
              id: `line_${invoice.id}`,
              description: brand.copy.lineItem(planLabel(invoice.plan)),
              quantity: 1,
              unitPriceCents: totalCents,
              amountCents: totalCents,
            },
          ],
        },
      },
    });
  }

  for (const dispute of DISPUTES) {
    const invoice = INVOICES.find((row) => row.id === dispute.invoiceId);
    if (!invoice) {
      throw new Error(`Seed dispute ${dispute.id} points at a missing invoice.`);
    }
    await prisma.dispute.create({
      data: {
        id: dispute.id,
        invoiceId: dispute.invoiceId,
        workspaceId: "ws_fieldnote",
        status: dispute.status,
        reason: dispute.reason,
        openedOn: demoDay(dispute.openedOn),
        disputedAmountCents: dispute.disputedAmountCents,
        suggestedCreditCents: suggestDisputeCredit({
          disputedAmountCents: dispute.disputedAmountCents,
          planPriceCents: planPriceCents(invoice.plan),
        }),
        reviewerNote: dispute.reviewerNote ?? null,
      },
    });
  }

  // Extra book accounts — one customer + one invoice each.
  for (const [index, account] of EXTRA_ACCOUNTS.entries()) {
    await prisma.customer.create({
      data: {
        id: account.customerId,
        workspaceId: "ws_fieldnote",
        name: account.name,
        contactName: account.contactName,
        email: account.email,
        plan: account.plan,
        createdAt: demoDay("2026-02-02"),
      },
    });
    const state = extraInvoiceState(index);
    const totalCents = planPriceCents(account.plan);
    await prisma.invoice.create({
      data: {
        id: account.invoiceId,
        number: account.invoiceNumber,
        workspaceId: "ws_fieldnote",
        customerId: account.customerId,
        plan: account.plan,
        status: state.status,
        issuedOn: demoDay(state.issuedOn),
        dueOn: demoDay(state.dueOn),
        paidOn: "paidOn" in state && state.paidOn ? demoDay(state.paidOn) : null,
        subtotalCents: totalCents,
        taxCents: 0,
        totalCents,
        memo: brand.copy.extraInvoiceMemo(planLabel(account.plan), account.name),
        lines: {
          create: [
            {
              id: `line_${account.invoiceId}`,
              description: brand.copy.lineItem(planLabel(account.plan)),
              quantity: 1,
              unitPriceCents: totalCents,
              amountCents: totalCents,
            },
          ],
        },
      },
    });
  }

  const [customers, invoices, disputes] = await Promise.all([
    prisma.customer.count(),
    prisma.invoice.count(),
    prisma.dispute.count(),
  ]);
  console.log(
    `Seeded ${brand.workspaceName} · ${customers} customers (${EXTRA_ACCOUNTS.length} extra book accounts) · ${invoices} invoices · ${disputes} disputes`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
