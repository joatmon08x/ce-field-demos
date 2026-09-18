/** Ledgerly Linear board. Titles stay stable across per-operator setup. */

export const LINEAR_FIELD_DEMOS_PROJECT = {
  name: "ce-field-demos",
  summary: "Personal Ledgerly board with three scoped Fieldnote issues.",
  workspace: "Fieldnote Workspace",
  operator: "Avery Quinn",
  catalogPricesUsd: ["$49", "$99", "$249"] as const,
  ledgerlyUrl: "http://127.0.0.1:43173",
} as const;

export type FieldDemoIssueType = "Story" | "Bug";
export type FieldDemoIssueStatus = "Todo" | "In Progress";
export type FieldDemoPriority = 2 | 3;

export type FieldDemoIssue = {
  slug: "email-on-invoice" | "suggested-credit-v1" | "filter-pills";
  type: FieldDemoIssueType;
  state: FieldDemoIssueStatus;
  /** Linear: 2=High, 3=Medium */
  priority: FieldDemoPriority;
  title: string;
  /** Prior titles still on a board; restage updates those issues in place. */
  previousTitles?: readonly string[];
  description: string;
  ledgerlyPaths: readonly string[];
  ledgerlyUrls: readonly string[];
};

export const FIELD_DEMO_ISSUES: readonly FieldDemoIssue[] = [
  {
    slug: "suggested-credit-v1",
    type: "Bug",
    state: "In Progress",
    priority: 2,
    title: "Suggested credit on dsp_1043 shows $400 instead of the $249 Scale cap",
    previousTitles: ["Dispute dsp_1043 claims $400 against a $249 Scale invoice"],
    description: `## Bug

Open http://127.0.0.1:43173/disputes/dsp_1043. The Resolution card shows **Suggested credit $400.00**. INV-1043 is Scale at **$249**. Expected suggested credit is **$249.00**.

The $400 figure is Cobalt Goods' claim, not a fourth catalog price. Do not change the stored claim. The page still calls deprecated suggested-credit v1, which returns the raw claim. v2, the domain helper, and the seed already cap at $249.

## Acceptance

- Client selects /api/v2/disputes/*/suggested-credit.
- dsp_1043 still stores a $400 claim against INV-1043 (Scale $249).
- v1 and v2 routes remain; tests/suggested-credit-api.test.ts is not edited to force green.

## Paths

- \`lib/disputes/suggested-credit-api.ts\`
- \`app/disputes/[id]/page.tsx\`
- \`app/api/v1/disputes/[id]/suggested-credit/route.ts\`
- \`app/api/v2/disputes/[id]/suggested-credit/route.ts\`

## Verify

- http://127.0.0.1:43173/disputes/dsp_1043 — suggested credit reads $249.00
- Claim on the dispute stays $400. Scale stays $249.`,
    ledgerlyPaths: [
      "lib/disputes/suggested-credit-api.ts",
      "app/disputes/[id]/page.tsx",
      "app/api/v1/disputes/[id]/suggested-credit/route.ts",
      "app/api/v2/disputes/[id]/suggested-credit/route.ts",
    ],
    ledgerlyUrls: ["http://127.0.0.1:43173/disputes/dsp_1043"],
  },
  {
    slug: "filter-pills",
    type: "Bug",
    state: "Todo",
    priority: 2,
    title: "Clicking Overdue or Needs review does not filter the queue",
    previousTitles: ["Overdue / Needs review filter does not change the list"],
    description: `## Bug

On http://127.0.0.1:43173/invoices, click **Overdue**. The table still shows every invoice and **All** stays highlighted.

On http://127.0.0.1:43173/disputes, click **Needs review**. The queue still shows every dispute and **All** stays highlighted.

Same control on both pages. Fix filter selection so the active pill matches the rows. Do not split this into two issues.

## Acceptance

- On /invoices, Overdue shows only OVERDUE rows and only that pill is active.
- On /disputes, Needs review shows only NEEDS_REVIEW rows and only that pill is active.
- All still lists the full seeded book.

## Paths

- \`components/filter-pills.tsx\`
- \`app/invoices/page.tsx\`
- \`app/disputes/page.tsx\`

## Verify

- http://127.0.0.1:43173/invoices
- http://127.0.0.1:43173/disputes`,
    ledgerlyPaths: ["components/filter-pills.tsx", "app/invoices/page.tsx", "app/disputes/page.tsx"],
    ledgerlyUrls: ["http://127.0.0.1:43173/invoices", "http://127.0.0.1:43173/disputes"],
  },
  {
    slug: "email-on-invoice",
    type: "Story",
    state: "Todo",
    priority: 3,
    title: "Invoice detail has no control to change customer email",
    previousTitles: ["Change customer email on invoice detail"],
    description: `## Story

Open an invoice from http://127.0.0.1:43173/invoices. The customer card shows the seeded contact email with no way for Avery Quinn to change it. Add a control on that card. Do not add email-format validation.

Invoice amounts stay on the catalog: Starter $49, Growth $99, Scale $249. Customer names and .example addresses stay on the Fieldnote book.

## Acceptance

- Invoice detail customer card can change the seeded contact email.
- No email-format validation is added.
- Customer names and .example addresses stay on the Fieldnote book.

## Paths

- \`app/invoices/[id]/page.tsx\`

## Verify

- http://127.0.0.1:43173/invoices — pick any invoice, edit email on the customer card

Matches the 101 Plan beat. Keep the change on the invoice detail customer card.`,
    ledgerlyPaths: ["app/invoices/[id]/page.tsx"],
    ledgerlyUrls: ["http://127.0.0.1:43173/invoices"],
  },
] as const;

export const FIELD_DEMO_SUGGESTED_CREDIT_TITLE = FIELD_DEMO_ISSUES.find(
  (issue) => issue.slug === "suggested-credit-v1",
)!.title;

export const FIELD_DEMO_FILTER_TITLE = FIELD_DEMO_ISSUES.find(
  (issue) => issue.slug === "filter-pills",
)!.title;
