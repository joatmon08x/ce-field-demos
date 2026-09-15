---
name: remap-industry
description: Remap this billing demo to another industry by swapping branding and seed copy while keeping invoices, disputes, collections, catalog prices, and 101/201 demo beats. Use when someone asks to change Ledgerly/Routerly into a vertical (SaaS, ops, medical, networking) or to apply a new product name like Routerly.
---

# Remap the demo to an industry

Keep the **billing domain**. The app still tracks invoices, credits, disputes, and collections. Change the **skin**: product name, workspace fiction, invoice line copy, and operator workspace. Do not fork a second app.

Worked example already applied: **Routerly** — networking router and switch invoices. Identity lives in `lib/brand.ts`.

## Freeze (do not change unless the user names the exact edit)

- Catalog: Starter **$49**, Growth **$99**, Scale **$249** in `lib/plans.ts`. No fourth price, ARR, usage overage, or "enterprise" tier.
- Routes and Prisma models: `/invoices`, `/collections`, `/disputes`, `Invoice`, `Dispute`, `Customer`.
- Stable ids: `inv_1043`, `INV-1043`, `dsp_1043`, `cus_*`, `ws_fieldnote`. Dispute `dsp_1043` still claims **$400** against a **$249** Scale invoice.
- Nav labels **Collections**, mock services **Nudge** / **Pulse**, and product names **Slatebook** / **Harborbill**.
- 101 and 201 beat **ids**, **titles**, and **copy-paste `example` strings** in `lib/runbooks/beats/`. Leave "invoice" in the Plan beat. Leave the `/best-of-n` Ledgerly wording if it is still a beat example.
- Suggested-credit v1 client, both v1/v2 routes, `tests/suggested-credit-api.test.ts`, and the resolve stub.
- Technical filenames and keys: `ledgerly-db`, `ledgerly-reviewer`, `start-ledgerly`, `ledgerly-theme`, CSS ids like `ledgerlyRevenue`.
- Seed **customer names** and `.example` emails unless a name collides with the new product (e.g. do not leave "Ledgerly Inc" as a customer of Ledgerly). Operator stays **Avery Quinn**.
- Do not add talk-track skills or a fourth catalog-solving agent.

## Remap (do change)

1. Set identity in `lib/brand.ts`: `name`, `workspaceName`, `industryShort`, `lineItemNoun`. Keep `workspaceId` / `workspaceSlug` as `ws_fieldnote` / `fieldnote`.
2. Point UI and metadata at `PRODUCT` (`components/logo.tsx`, `app/layout.tsx`, `app/page.tsx`, `components/app-chrome.tsx`, `lib/demo-session.ts`, settings, empty states, error page).
3. Seed copy only: workspace **display** name, invoice memos, line descriptions via `monthlySupportLine` / `cycleMemo`. Do not retarget disputes or invent amounts.
4. Operator email may use a new `.example` domain that matches the workspace fiction.
5. User-facing docs and always-on rules: `README.md`, `AGENTS.md`, `demo-howto.md` framing (not the beat pastes that must match `lib/runbooks/beats/`), `.cursor/rules/ledgerly.mdc` (keep the filename), skills that mention the old workspace in **visible** copy (`draft-collection-email`, `reset-demo-state`, `start-ledgerly` description).
6. MCP **tool descriptions** that humans read. Keep the server name `ledgerly-db`.
7. `.cursor/environment.json` display `name` and port label. `package.json` `description`.
8. Register this skill in `lib/runbooks/agents.ts` `PROJECT_SKILLS` if it is not already there.

## Do not treat as a domain rewrite

Meetings may suggest turning invoices into device inventory. Ignore that unless the user asks. Invoice detail, customer-email Plan beat, and accounts-receivable copy stay invoices.

## Verify

- `npx prisma db seed` then `npm test` — still **1 failed / 31 passed**, failure only `tests/suggested-credit-api.test.ts`.
- Dashboard wordmark and title show the new product; catalog still `$49 / $99 / $249`.
- `/invoices/inv_1043` and `/disputes/dsp_1043` still exist; v1 suggested credit still **$400**.
- `/runbooks/101` Plan card still says **invoice detail customer card**.
- No real company names or invented prices.
