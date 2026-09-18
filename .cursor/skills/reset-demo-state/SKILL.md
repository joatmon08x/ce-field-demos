---
name: reset-demo-state
description: Put a Ledgerly demo machine back to the shipped state — reseed SQLite, restore the expected red test, free the port, clear stray edits, drop personal rules, delete the Canvas, delete Figma slides if this demo created any, cancel Linear issues if this demo staged them. Use when a demo just ended, the data looks wrong, tests are unexpectedly green, or the dev server will not start.
---

# Reset the demo state

Goal state: seeded Fieldnote book, dev server on 43173, `npm test` showing exactly **1 failed / 31 passed**, no leftover personal rules from `/create-rule`, no leftover Canvas from the 101 beat, no leftover Figma Slides deck from the 101 MCP beat, and no leftover issues on the private `ce-field-demos` Linear project. Restore `lib/disputes/suggested-credit-api.ts` if a prior demo switched the client to v2. Restore `components/filter-pills.tsx` if a prior demo renamed the pill query key from `state` to `status`.

## Checklist (run what applies)

1. **Stray edits from the last demo**

```bash
git status
git checkout -- lib/disputes/suggested-credit-api.ts   # shipped client selects v1
git checkout -- components/filter-pills.tsx            # shipped pills write state=
rm -f .cursor/rules/suggested-credit-api-v2.mdc       # live /create-rule beat only
git checkout -- .                        # only if the user agrees to drop ALL local changes
```

2. **Personal rules**

List user rules, then remove every one. Demo `/create-rule` leftovers must not survive a reset.

Use `cursor_dialog` in the `cursor-app-control` namespace (`item: "rule"`, `scope: "user"`):

1. `action: "list"`
2. For each returned `id`, `action: "remove"` with that `id`

If the list is empty, skip. Report titles you removed. Do not recreate them.

3. **Delete the Canvas**

Canvases from the 101 beat live outside the repo. Grok Build only picks up files in `~/.cursor/projects/<workspace-slug>/canvases/`. The slug is the absolute repo path with `/` replaced by `-` (example: `~/.cursor/projects/Users-operator-ce-field-demos/canvases/`).

Delete leftover canvas artifacts:

```bash
REPO="$(git rev-parse --show-toplevel)"
SLUG="${REPO#/}"
SLUG="${SLUG//\//-}"
CANVASES="$HOME/.cursor/projects/${SLUG}/canvases"
ls -1 "$CANVASES"/*.canvas.tsx "$CANVASES"/*.canvas.data.json 2>/dev/null
rm -f "$CANVASES"/*.canvas.tsx "$CANVASES"/*.canvas.data.json
```

Report the filenames you removed. If none exist, skip. Do not delete `tsconfig.json`, `node_modules/`, or the `canvases/` directory itself.

4. **Figma slides (only if this demo created a deck)**

If the conversation created a Figma Slides file (101 MCP beat; URL like `https://www.figma.com/slides/<fileKey>`), delete its slides.

There is no file-delete tool on the Figma MCP. Load `figma-use` and `figma-use-slides`, then `use_figma` on that `fileKey`:

```js
const grid = figma.getSlideGrid();
for (const row of grid) {
  for (const slide of [...row]) {
    slide.remove();
  }
}
return { remaining: figma.getSlideGrid().flat().length };
```

Expect `remaining: 0`. If no Slides URL or fileKey appears in this session, skip. Do not hunt other teams' files.

5. **Linear issues (only if this demo staged the board)**

If this session ran `stage-linear` or created issues on `ce-field-demos`, cancel them so the next run starts with an empty private board. Linear MCP has no issue-delete tool.

Authenticate Linear (`mcp_auth` if tools are gated). Confirm `get_user` with `"me"`:

- `isGuest` is false
- The **private** field-demos team is in `teams`

If Linear MCP is missing, auth fails, or `teams` is only public teams, skip.

`list_projects` with query `ce-field-demos`. Act **only** when the project’s `teams` are exactly the operator’s private team and `lead` is the operator (`me`). If the only match is on a public or shared team, skip. Do not cancel other teams’ issues.

`list_issues` on that project. For every issue on it (catalog titles from `FIELD_DEMO_ISSUES` in `lib/runbooks/linear-field-demos.ts`, plus any leftover filler), `save_issue`:

- `id`: the issue identifier
- `project`: `null` (unlink from the board)
- `state`: `Canceled`

Leave the private team and the empty project in place. `stage-linear` recreates the catalog issues next time. Do not delete the team — Linear MCP cannot create teams.

If this session never staged Linear, or the private project has no issues, skip. Report identifiers and titles you canceled. Do not hunt other workspaces.

6. **Database looks wrong / empty dashboard**

```bash
npx prisma db seed        # idempotent: pushes schema + reloads Fieldnote
# nuclear option if the file is corrupt:
npm run db:reset
```

There are no migrations in this repo — never run `prisma migrate`; the seed's `db push` is the whole story.

7. **Port 43173 busy**

```bash
lsof -ti :43173 | xargs kill   # macOS/Linux/WSL
npm run dev
```

8. **Verify shipped state**

```bash
npm test    # expect: 1 failed (suggested-credit-api), 31 passed
```

Open `http://127.0.0.1:43173` — dashboard shows Fieldnote data, catalog $49/$99/$249, disputes badge on the sidebar.

Open `http://127.0.0.1:43173/disputes/dsp_1043` — the Resolution panel shows a red **Suggested credit $400.00** from v1 above the $249 Scale price. Confirm `/api/v2/disputes/dsp_1043/suggested-credit` returns $249.00. If the page reads $249.00 from v2, restore `lib/disputes/suggested-credit-api.ts`.

## Never

- Never delete `prisma/seed.ts` data or add customers to "fix" a demo.
- Never edit `tests/suggested-credit-api.test.ts`, either API route, or the seed to make the shipped red test green.
- Never leave `.cursor/rules/suggested-credit-api-v2.mdc` in the shipped tree; create and remove it during the live rule beat.
- Never leave personal `/create-rule` leftovers, a leftover Canvas, a demo Slides deck, or active `ce-field-demos` Linear issues after reset when those apply.
- Never cancel Linear issues on a public or shared team. Never delete the operator’s private team.
