import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import { PLAN_PRICE_CENTS } from "@/lib/plans";

export const TDD_INVOICE_ID = "inv_1043";
export const TDD_WORKSPACE_ID = "ws_fieldnote";
export const DSP_1043_SEEDED = {
  status: "NEEDS_REVIEW",
  reviewerNote: null as string | null,
  suggestedCreditCents: PLAN_PRICE_CENTS.SCALE,
  disputedAmountCents: 40_000,
};

export async function requireSeededScaleInvoice() {
  const invoice = await prisma.invoice.findUnique({ where: { id: TDD_INVOICE_ID } });
  if (!invoice) {
    throw new Error("Seed prisma/dev.db first: npx prisma db seed");
  }
  return invoice;
}

export async function createTddDispute(id: string, suggestedCreditCents: number) {
  await prisma.dispute.deleteMany({ where: { id } });
  return prisma.dispute.create({
    data: {
      id,
      invoiceId: TDD_INVOICE_ID,
      workspaceId: TDD_WORKSPACE_ID,
      status: "NEEDS_REVIEW",
      reason: "TDD fixture. Not a customer story.",
      openedOn: new Date("2026-08-11T00:00:00.000Z"),
      disputedAmountCents: 40_000,
      suggestedCreditCents,
      reviewerNote: null,
    },
  });
}

export async function deleteTddDisputes() {
  await prisma.dispute.deleteMany({
    where: { id: { startsWith: "dsp_tdd_" } },
  });
}

export async function restoreDsp1043() {
  const existing = await prisma.dispute.findUnique({ where: { id: "dsp_1043" } });
  if (!existing) return;
  await prisma.dispute.update({
    where: { id: "dsp_1043" },
    data: {
      status: DSP_1043_SEEDED.status,
      reviewerNote: DSP_1043_SEEDED.reviewerNote,
      suggestedCreditCents: DSP_1043_SEEDED.suggestedCreditCents,
      disputedAmountCents: DSP_1043_SEEDED.disputedAmountCents,
    },
  });
}

export function resolutionUiSource() {
  let extra: string[] = [];
  try {
    extra = readdirSync("components/disputes")
      .filter((name) => name.endsWith(".tsx") || name.endsWith(".ts"))
      .filter((name) => name !== "suggested-credit.tsx")
      .map((name) => join("components/disputes", name));
  } catch {
    extra = [];
  }
  const files = ["app/disputes/[id]/page.tsx", ...extra];
  return files
    .map((file) => `// FILE ${file}\n${readFileSync(file, "utf8")}`)
    .join("\n");
}

export function readOwned(path: string) {
  return readFileSync(path, "utf8");
}
