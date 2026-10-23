---
name: start-ledgerly
description: Start the Ledgerly Next.js app on port 43173, seed SQLite only when the database is missing or empty, open the app in the Grok Build Browser, and open runbooks.html in a Cursor Canvas. Use when the user asks to start the server, start the application, run the demo app, open Ledgerly in the browser, or seed if it has not already been seeded.
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

## 4. Open the application, then the runbooks in Canvas

After the server is Ready (or already responding), do both of these even when the server was already running.

1. Open the Grok Build Browser (`cursor-ide-browser`) to **http://localhost:43173**. Use `position: "active"` so the browser is visible. This tab is the Ledgerly application. Leave it there. Do not use an external browser. Do not open a second browser tab for the runbooks. Do not open the in-app `/runbooks` route.

2. Open `runbooks.html` in a Cursor Canvas. Read `~/.cursor/skills-cursor/canvas/SKILL.md`, then read `runbooks.html` at the repo root. Call `WriteCanvas` directly. Title: `Runbooks` only when creating the canvas. The module imports `Button`, `useCanvasState`, `useEffect`, and `useRef` from `cursor/canvas` and default-exports one component. Serialize the exact file contents into an `html` string; do not use `fetch`. Do not put zoom or session state into generated `runbooks.html`.

   **Sticky session.** `WriteCanvas` without a `canvas_id` creates a new canvas whose sidecar defaults to track `101`. When a Runbooks canvas is already open in this run, pass its `canvas_id` and omit the title so the same sidecar is reused. Persist three keys with `useCanvasState` on that canvas:

   - `runbooks-track` — string, default `"101"`
   - `runbooks-features` — the 301 optional-feature map (object), default `{}`
   - `runbooks-zoom` — number, default `1`

   Reopening that canvas is what the hook covers. Do not mint a new canvas when one is already open.

   The component fills the view with chrome (Zoom out / Zoom in) and an `<iframe title="Ledgerly runbooks" srcDoc={html} />`:

   - Keep a ref to the iframe.
   - Accept `message` events only when `event.source === iframe.contentWindow`. Skip an `event.origin` allowlist: a srcdoc frame reports `"null"`, and that check drops the message.
   - When it posts `{ type: "runbooks:track", track }`, validate the track against `["101", "201", "301"]` and save it to `runbooks-track`.
   - When it posts `{ type: "runbooks:features", features }`, save that object to `runbooks-features`.
   - **Catalog check.** After the iframe loads, the page must reply with `{ type: "runbooks:catalog", options, visibleTrack }` once it has applied `runbooks:set-track`. Confirm `options` are exactly `["101", "201", "301"]` (a `select#track` with those options) and `visibleTrack` matches the restored track. Treat a missing or mismatched reply as a failed open. Do not report the canvas ready until that reply matches.
   - On the iframe `load` event only, post the saved track and the saved feature map — never the default `101` over a saved track:

     ```
     iframe.contentWindow.postMessage({ type: "runbooks:set-track", track }, "*")
     iframe.contentWindow.postMessage({ type: "runbooks:set-features", features }, "*")
     ```

     The page applies `runbooks:set-track` with `show(data.track, false)`, so it does not echo. Restoring the track must not reset feature checkboxes; those checkboxes are restored from the sidecar via `runbooks:set-features`, not from srcdoc `localStorage`, which does not survive a rebuilt iframe. A later post of an older value can overwrite a newer Catalog choice, and the parent will not hear about it.

   **Zoom.** Add Zoom out and Zoom in controls in the canvas chrome, outside the iframe, using `Button` from `cursor/canvas`. Store the level in `useCanvasState` (`runbooks-zoom`, default `1`). Step by `0.25` between `0.5` and `2`. Apply it as CSS `zoom` on the iframe.

   The event bridge is required: an iframe created with `srcDoc` is rebuilt when the user leaves and reopens the canvas, while `useCanvasState` survives canvas reloads and IDE restarts. Do not replace it with component-local state or iframe storage. The embedded page otherwise opens on track 101. `runbooks.html?track=301` selects 301 when the file is opened on its own. On 301, each optional feature is a checkbox, checked by default. Unchecking a feature hides its beats. Restoring a track does not change those checkboxes.

## 5. Confirm

Report **http://localhost:43173**, the canvas `url` returned by `WriteCanvas`, that the catalog reply matched (`options` `101`/`201`/`301` and the restored `visibleTrack`), and whether you seeded or skipped seed. The browser tab is the Ledgerly dashboard. The canvas shows the Catalog control and Zoom out / Zoom in.
