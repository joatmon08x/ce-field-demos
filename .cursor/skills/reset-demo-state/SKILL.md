---
name: reset-demo-state
description: Put a Ledgerly demo machine back to the shipped state — reseed SQLite, restore the expected red test, free the port, clear stray edits. Use when a demo just ended, the data looks wrong, tests are unexpectedly green, or the dev server will not start.
---

# Reset the demo state

Goal state: seeded Fieldnote book, dev server on 43173, and `npm test` showing exactly **1 failed / 31 passed**. Restore `lib/disputes/suggested-credit-api.ts` if a prior demo switched the client to v2.

## Checklist (run what applies)

1. **Stray edits from the last demo**

```bash
git status
git checkout -- lib/disputes/suggested-credit-api.ts   # shipped client selects v1
rm -f .cursor/rules/suggested-credit-api-v2.mdc       # live /create-rule beat only
git checkout -- .                        # only if the user agrees to drop ALL local changes
```

2. **Database looks wrong / empty dashboard**

```bash
npx prisma db seed        # idempotent: pushes schema + reloads Fieldnote
# nuclear option if the file is corrupt:
npm run db:reset
```

There are no migrations in this repo — never run `prisma migrate`; the seed's `db push` is the whole story.

3. **Port 43173 busy**

```bash
lsof -ti :43173 | xargs kill   # macOS/Linux/WSL
npm run dev
```

4. **Verify shipped state**

```bash
npm test    # expect: 1 failed (suggested-credit-api), 31 passed
```

Open `http://127.0.0.1:43173` — dashboard shows Fieldnote data, catalog $49/$99/$249, disputes badge on the sidebar.

Open `http://127.0.0.1:43173/disputes/dsp_1043` — the Resolution panel shows a red **Suggested credit $400.00** from v1 above the $249 Scale price. Confirm `/api/v2/disputes/dsp_1043/suggested-credit` returns $249.00 and the ledgerly-db MCP reports stored credit $249.00. If the page reads $249.00 from v2, restore `lib/disputes/suggested-credit-api.ts`.

## Never

- Never delete `prisma/seed.ts` data or add customers to "fix" a demo.
- Never edit `tests/suggested-credit-api.test.ts`, either API route, or the seed to make the shipped red test green.
- Never leave `.cursor/rules/suggested-credit-api-v2.mdc` in the shipped tree; create and remove it during the live rule beat.
