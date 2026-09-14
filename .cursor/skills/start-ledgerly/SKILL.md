---
name: start-ledgerly
description: Start the Next.js billing demo on port 43173 and seed SQLite only when the database is missing or empty. Use when the user asks to start the server or run the demo app without naming Medly, SaaSly, or Routerly. If they name one of those companies, use start-application instead.
---

# Start the demo app

Bring up the app for the currently active brand in `lib/brand/active.ts`. Do not reset demo state, restore files, or kill a healthy server.

Listen on **43173**. Schema URL is `file:./dev.db` in `prisma/schema.prisma`. Seed is idempotent (`prisma db push` then the active brand) but **skip it when data is already there**.

## 1. Dependencies

If `node_modules` is missing:

```bash
npm i
npx prisma generate
```

## 2. Seed only if needed

The database needs seed when `prisma/dev.db` is missing, Prisma cannot query `Customer`, or `customer.count()` is `0`.

```bash
npx tsx -e '
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
try {
  const n = await prisma.customer.count();
  console.log(n > 0 ? "seeded" : "empty");
} catch {
  console.log("missing");
} finally {
  await prisma.$disconnect();
}
'
```

- `seeded` — do not seed.
- `empty` or `missing` — run `npx prisma db seed`.

Never run `prisma migrate` or `npm run db:reset` from this skill. Those belong to `reset-demo-state`.

## 3. Start the server

If a terminal already has `npm run dev` on **43173**, or `http://127.0.0.1:43173` responds, leave it. Report the URL.

Otherwise start in the background:

```bash
npm run dev
```

Request host/`all` permissions if bind fails (`uv_interface_addresses` or similar). Wait until the log shows Ready / `http://localhost:43173`.

Do not `lsof | kill` a busy 43173 — that is a reset, not a start.

## 4. Confirm

Report **http://localhost:43173** and whether you seeded or skipped seed.
