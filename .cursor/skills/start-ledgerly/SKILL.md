---
name: start-ledgerly
description: Start the Ledgerly Next.js app on port 43173, seed SQLite only when the database is missing or empty, then open it in the Grok Build Browser with a second tab on the runbooks view. Use when the user asks to start the server, start the application, run the demo app, open Ledgerly in the browser, or seed if it has not already been seeded.
---

# Start Ledgerly

Bring up the app. Do not reset demo state, restore files, or kill a healthy server.

Listen on **43173**. Schema URL is `file:./dev.db` in `prisma/schema.prisma`. Seed is idempotent (`prisma db push` then Fieldnote data) but **skip it when data is already there**.

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

## 4. Open the Grok Build Browser

After the server is Ready (or already responding), open the app in the Grok Build Browser (`cursor-ide-browser`). Do this even when the server was already running. Use `position: "active"` so the browser is visible.

1. Navigate to **http://localhost:43173** (the application).
2. Open a **second tab** (`newTab: true`) to the runbooks view: **http://localhost:43173/runbooks**.

Do not use an external browser. Do not replace the first tab with `/runbooks`.

## 5. Confirm

Report **http://localhost:43173** and **http://localhost:43173/runbooks**, and whether you seeded or skipped seed.
