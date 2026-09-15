---
name: start-application
description: Activate a vertical billing profile (Medly, SaaSly, or Routerly) from a presenter prompt like "Start the Medly application". Treat "Routely" as Routerly. Use when the user names one of those companies or asks to start the demo app for a healthcare, SaaS, or networking audience. There is no in-app picker.
---

# Start a vertical application

The clone has no company picker in the UI. The presenter (or first prompt) names the company. Activate that profile, reseed, and stop. Do not invent a fourth brand.

## Profiles

| Prompt | Id | Industry |
| --- | --- | --- |
| Start the Medly application | `medly` | Healthcare provider — membership statements |
| Start the SaaSly application | `saasly` | SaaS subscription billing |
| Start the Routerly application | `routerly` | Networking company — network-service billing |

Names always end in **ly**. Never use a real company, hospital system, or prospect logo.

Parse with `parseStartPrompt` in `lib/brand/index.ts`. If the name is missing or unknown, list the three rows above and stop.

## Steps

1. Set only `ACTIVE_BRAND_ID` in `lib/brand/active.ts` to the matching literal id (for example, `"routerly"`). Never edit `SHIPPED_DEFAULT_BRAND_ID`; it stays `"saasly"` so reset can restore the shipped default. Treat “Routely” as Routerly. There is no dropdown to add.
2. Do not change catalog prices, invoice/dispute ids, API routes, `tests/suggested-credit-api.test.ts`, or the resolve stub.
3. Run `npx prisma db seed` so customer names and memos match the profile.
4. Run `npm test`. Expect **1 failed / 36 passed**. The sole red test is `tests/suggested-credit-api.test.ts` for Medly, SaaSly, and Routerly alike — the planted v1 client is brand-independent. Do not edit that test to get green.
5. Confirm `npm run dev` is on **43173**. Ask the user to refresh the browser.
6. Report: product name, industry, operator role, that Starter / Growth / Scale remain $49 / $99 / $249, and that the suite is still **1 failed / 36 passed**.

## What the profile already drives

`getActiveBrand()` feeds the wordmark, tokens, seed names, invoice memos, dispute reasons, and **adaptable** runbook examples (`promptType: "adaptable"`). Reusable and `none` beats stay as written.

Command runbooks (`/multitask`, `/loop`, `/autopilot`, `/goal`, `/orchestrate`) interpolate the product name only. File paths stay the same.

## Never

- Do not add a settings/nav control to pick the company.
- Do not add a fourth `*ly` brand unless the user explicitly asks.
- Do not invent prices, ARR, or a real customer.
- Do not migrate suggested-credit v1→v2 or finish dispute resolution as part of a start prompt. Medly and Routerly keep the same planted red test as SaaSly.
- Do not add a talk-track skill.
