/**
 * Ledgerly 201 Linear book — same five cards as the retired CompanyTicket board.
 * Keys were LY-001…LY-005. Linear identifiers are minted per operator when
 * `stage-linear-201` runs. Titles stay stable so runbook pastes work before IDs exist.
 */

export const LINEAR_FIELD_DEMOS_PROJECT = {
  name: "ce-field-demos",
  summary: "Personal Ledgerly 201 board. Same five cards as the retired CompanyTicket book.",
  workspace: "Fieldnote Workspace",
  operator: "Avery Quinn",
  catalogPricesUsd: ["$49", "$99", "$249"] as const,
  ledgerlyUrl: "http://127.0.0.1:43173",
} as const;

export type FieldDemoIssueType = "Story" | "Bug" | "Task";
export type FieldDemoIssueStatus = "Backlog" | "Todo" | "In Progress";
export type FieldDemoPriority = 2 | 3 | 4;

export type FieldDemoIssue = {
  slug: "email-on-invoice" | "suggested-credit-v1" | "filter-pills" | "tidewatch-dunning" | "settings-clock";
  type: FieldDemoIssueType;
  state: FieldDemoIssueStatus;
  /** Linear: 2=High, 3=Medium, 4=Low */
  priority: FieldDemoPriority;
  title: string;
  description: string;
  ledgerlyPaths: readonly string[];
  ledgerlyUrls: readonly string[];
};

export const FIELD_DEMO_ISSUES: readonly FieldDemoIssue[] = [
  {
    slug: "email-on-invoice",
    type: "Story",
    state: "Todo",
    priority: 3,
    title: "Change customer email on invoice detail",
    description: `Add a control on the invoice detail customer card so Avery Quinn can update the customer email. Do not implement email validation. Invoice amounts stay on the catalog: Starter $49, Growth $99, Scale $249.

## Acceptance

- Invoice detail customer card can change the seeded contact email.
- No email-format validation is added.
- Customer names and .example addresses stay on the Fieldnote book.

## Paths

- \`app/invoices/[id]/page.tsx\`

## Verify

- http://127.0.0.1:43173/invoices

Matches the 101 Plan beat. Keep the change on the invoice detail customer card.`,
    ledgerlyPaths: ["app/invoices/[id]/page.tsx"],
    ledgerlyUrls: ["http://127.0.0.1:43173/invoices"],
  },
  {
    slug: "suggested-credit-v1",
    type: "Bug",
    state: "In Progress",
    priority: 2,
    title: "Dispute dsp_1043 claims $400 against a $249 Scale invoice",
    description: `Dispute dsp_1043 claims $400 against a $249 Scale invoice. Open http://127.0.0.1:43173/disputes/dsp_1043. The page still selects deprecated suggested-credit v1 and shows $400.00. v2, the domain helper, the seed stored credit, and ledgerly-db MCP cap at the Scale catalog price of $249. Do not correct the $400 claim — it is valid input for the catalog cap. Preserve both v1 and v2 routes and tests/suggested-credit-api.test.ts.

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

- http://127.0.0.1:43173/disputes/dsp_1043

The $400 figure is the claim, not a fourth catalog price. Scale stays $249.`,
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
    title: "Overdue / Needs review filter does not change the list",
    description: `On http://127.0.0.1:43173/invoices (or /disputes), click Overdue / Needs review. The list does not change. All stays highlighted. Reproduce on both list pages, then fix only the filter selection so one pill is active and the table or queue matches that status.

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
- http://127.0.0.1:43173/disputes

Same control on invoices (Overdue) and disputes (Needs review). Treat them as one filter bug.`,
    ledgerlyPaths: ["components/filter-pills.tsx", "app/invoices/page.tsx", "app/disputes/page.tsx"],
    ledgerlyUrls: ["http://127.0.0.1:43173/invoices", "http://127.0.0.1:43173/disputes"],
  },
  {
    slug: "tidewatch-dunning",
    type: "Task",
    state: "Backlog",
    priority: 4,
    title: "Draft a Tidewatch Logistics dunning note",
    description: `Use the draft-collection-email skill. Tidewatch Logistics is on the Fieldnote book. Do not invent a price; keep the folio on Starter $49, Growth $99, or Scale $249 as seeded.

## Acceptance

- Copy names Tidewatch Logistics and stays inside the catalog.

## Paths

- \`app/collections/page.tsx\`

## Verify

- http://127.0.0.1:43173/collections`,
    ledgerlyPaths: ["app/collections/page.tsx"],
    ledgerlyUrls: ["http://127.0.0.1:43173/collections"],
  },
  {
    slug: "settings-clock",
    type: "Task",
    state: "Backlog",
    priority: 4,
    title: "Record Harborbill remittance window on Settings",
    description: `Settings already has a Cmd-K TODO. Leave that seam unless a later ticket names it. This card is backlog filler only.

## Acceptance

- No settings rewrite unless a later field-demo issue asks for it.

## Paths

- \`app/settings/page.tsx\`

## Verify

- http://127.0.0.1:43173/settings`,
    ledgerlyPaths: ["app/settings/page.tsx"],
    ledgerlyUrls: ["http://127.0.0.1:43173/settings"],
  },
] as const;

export const FIELD_DEMO_SUGGESTED_CREDIT_TITLE = FIELD_DEMO_ISSUES.find(
  (issue) => issue.slug === "suggested-credit-v1",
)!.title;

export const FIELD_DEMO_FILTER_TITLE = FIELD_DEMO_ISSUES.find(
  (issue) => issue.slug === "filter-pills",
)!.title;
