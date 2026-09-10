import type { PlanId } from "@/lib/plans";

export const BRAND_IDS = ["medly", "saasly", "routely"] as const;

export type BrandId = (typeof BRAND_IDS)[number];

export type BrandCustomer = {
  id: string;
  name: string;
  contactName: string;
  email: string;
  plan: PlanId;
};

export type ExtraAccount = {
  customerId: string;
  invoiceId: string;
  invoiceNumber: string;
  name: string;
  segment: string;
  plan: PlanId;
  contactName: string;
  email: string;
};

export type BrandPalette = {
  indigo: string;
  indigo600: string;
  indigo500: string;
  indigoSoft: string;
  indigoPage: string;
  indigoPageSoft: string;
};

export type BrandTokens = {
  light: BrandPalette;
  dark: BrandPalette;
};

export type BrandCopy = {
  dashboardSubtitle: string;
  invoicesDescription: string;
  invoicesEmpty: string;
  collectionsEyebrow: string;
  collectionsDescription: string;
  collectionsEmptyTitle: string;
  collectionsEmptyBody: string;
  disputesDescription: string;
  settingsDescription: string;
  sidebarBlurb: string;
  searchPlaceholder: string;
  lineItem: (planLabel: string) => string;
  extraInvoiceMemo: (planLabel: string, customerName: string) => string;
};

/** Adaptable runbook beat examples. Reusable / none beats stay in the beat files. */
export type BrandRunbookExamples = {
  plan: string;
  "model-fast": string;
  fix: string;
  "start-and-stop": string;
  "interrupt-steer": string;
  rule: string;
  "test-rule": string;
  skill: string;
  "test-skill": string;
  mcp: string;
  orient: string;
  customize: string;
  models: string;
  cloud: string;
  automations: string;
  "cli-ask": string;
};

export type BrandDisputeCopy = {
  reason: string;
  reviewerNote?: string;
};

export type BrandProfile = {
  id: BrandId;
  productName: string;
  industry: string;
  operatorRole: string;
  operatorEmail: string;
  workspaceName: string;
  tagline: string;
  tokens: BrandTokens;
  copy: BrandCopy;
  customers: BrandCustomer[];
  extraAccounts: ExtraAccount[];
  invoiceMemos: Record<string, string>;
  disputeCopy: Record<string, BrandDisputeCopy>;
  runbookExamples: BrandRunbookExamples;
};

export function isBrandId(value: string): value is BrandId {
  return (BRAND_IDS as readonly string[]).includes(value);
}
