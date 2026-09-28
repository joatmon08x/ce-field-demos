# Three contributors · three features

Reference plan for the side lab. These beats stay in this file. Do not add a 301 track, `/runbooks/301`, or copy-paste blocks in `demo-howto.md`.

## Isolation from 101 / 201

This multi-contributor theater is a **side lab**, not a shipped runbook track. Staging must leave `/runbooks/101`, `/runbooks/201`, `demo-howto.md`, and `stage-linear`’s three Fieldnote issues behaviorally identical.

### What must not change on `main`

| Keep intact | Why |
| --- | --- |
| `lib/runbooks/beats/101.ts`, `201.ts`, `meta.ts`, copy-paste blocks on `/runbooks/*` | Track source of truth |
| `demo-howto.md` presenter sequence | Cited by `tests/runbooks.test.ts` |
| Staged Linear trio via `stage-linear` / `FIELD_DEMO_ISSUES` | Exactly three issues; titles/order stable |
| Dispute **resolve stub** on `main` | 201 `/multitask @resolve-dispute` needs unfinished helper/route/buttons |
| Suggested-credit **v1 client** + red `tests/suggested-credit-api.test.ts` | Named 201 / board bug |
| Filter-pills `state=` seam | Planted UI bug; not this lab |
| Suite citation **1 failed / 32 passed** (until the suite intentionally changes) | Runbook test drift |

### Branch model — resettable lab refs

Stable names, ephemeral tips. Not two long-lived feature branches.

| Approach | Verdict |
| --- | --- |
| Two permanent branches that accumulate commits | No. They drift from `main` and a mistaken merge of resolve breaks 201. |
| Stable names reset each lab (`lab/dev-a-resolve`, `lab/dev-b-email`) | Yes. A stage script force-resets tips to golden SHAs. |
| Throwaway branches with no script | Fragile. Operators restage by hand and miss files. |

`main` keeps moving. A completed resolve branch is radioactive next to 201’s stub. B’s email branch duplicates the 101 implement path.

**What to stage**

1. Add `npm run demo:stage-lab` (name flexible) that:
   - Leaves `main` clean for 101/201
   - Resets `lab/dev-a-resolve` from a checked-in patch (resolve in progress, draft PR)
   - Resets `lab/dev-b-email` the same way (email complete enough for a ready PR)
   - Leaves Collections Command Center unstarted
2. Teach `npm run demo:reset` / `reset-demo-state` to close the lab PRs and reset those refs without touching the staged Linear three.
3. Never merge `lab/dev-a-resolve` onto `main` while 201 still owns the stub.

Permanent remote branches are only mirrors of the golden SHAs the stage script resets to.

### Where the Owns matrix lives

GitHub pull requests are the scout’s primary input. Make A a draft PR so both in-flight tracks look the same.

| Contributor | GitHub | Linear (optional) |
| --- | --- | --- |
| **A — resolve** | **Draft PR** from `lab/dev-a-resolve`. Never merge while 201 needs the stub. | Lab issue “In Progress” linking the draft PR |
| **B — email** | **Ready PR** awaiting review | Lab issue or staged email story linking the PR |
| **C — CCC** | No PR yet. Opens a ready PR after the build. | Lab issue “Todo” until C starts |

**Contract**

1. **Computed claims** (required): changed files on every open PR (draft and ready) versus `main`. This is what ownership-scout builds first.
2. **Declared Owns** (optional, in the PR body): `## Owns` / `## Must not`. If those headings exist, flag drift: files in the diff that are not in Owns, or Owns paths missing from the diff.
3. **Missing Owns:** if a pull request has no `## Owns` list, create that claim in `.cursor/owns-matrix.json` from the changed files. Do not add `## Owns` or `## Must not` to the pull request.
4. **Local snapshot:** scout writes gitignored `.cursor/owns-matrix.json` for `subagentStart`.
5. **Linear:** status and links only. Do not copy Owns onto the staged three Fieldnote issues.

`demo:stage-lab` resets branch tips, refreshes A’s draft PR and B’s ready PR, and leaves C without a PR. `demo:reset` closes lab PRs and deletes `owns-matrix.json`. It never merges A’s draft.

Offline, with no `gh` auth, fall back to Linear path lists plus the local branch diff. The default path assumes GitHub PRs.

### Branch and merge rules

| Work | Where it lives | Merge to `main`? |
| --- | --- | --- |
| **Developer A — resolve** | Draft PR | No, while 201 still demos the stub. |
| **Developer B — email** | Ready PR | Only if it matches the 101 acceptance (edit on the customer card, no validation, `.example` only) and does not rewrite runbook examples. |
| **Developer C — slim CCC** | Branch, then ready PR | Yes if additive (note Save + API + panel). Must not edit the resolve stub, suggested-credit client, filter pills, or runbook files. |
| **ownership-scout + `subagentStart` hook** | `.cursor/agents/`, `.cursor/hooks*` | Optional on `main`. Must not alter beat prompts. If `demo:session` records them, teach reset in the same change. |

### Linear

Do not add CCC stories to the staged `ce-field-demos` project. Use a separate private-team project, or keep the lab as plan and branch metadata. `stage-linear` and `reset-demo-state` reconcile only the three Fieldnote issues.

### Session hygiene

1. Start the lab on a dedicated git branch, not by rewriting `main` during 101 or 201.
2. Record lab leftovers in the demo session event log if the operator might also run 101 or 201 the same day.
3. End of lab: `npm run demo:reset`, then `reset-demo-state`. Restore the seed, cancel only the staged three issues, leave runbooks unchanged.
4. Switch back to `main` before a real 101 or 201 run so the stub and the planted red test are present.

Ship to `main` only B’s email (101-compatible) and/or C’s slim note feature. Leave A’s resolve unfinished on purpose.

## Cast

| Who | Feature | Starting state |
| --- | --- | --- |
| **Developer A** | Dispute resolve | In progress · draft PR · do not merge |
| **Developer B** | Invoice email | In progress · ready PR · waiting on C’s review |
| **Developer C (you)** | Collections Command Center (persist the collection note) | About to start · no PR yet |

Cursor chooses how many parallel agents inside the CCC coordinator. Machine-wide, prefer three or fewer concurrent Tasks.

## Demo beats — how Developer C gets started

1. **Orient** — `gh pr list`: A is the draft resolve PR, B is the ready email PR, C has none. Do not merge A.
2. **Review B’s email PR** — Confirm no validation, `.example` only, and whether `CustomerEmailCard` is already extracted.
3. **ownership-scout** — Pin a higher-reasoning model. Prompt is `.cursor/plans/ownership-scout.md`. Reads open PR file lists, writes `.cursor/owns-matrix.json`, and blocks dispatch while a hard collision remains. A missing `## Owns` list is created locally and not written onto the PR.
4. **Fence** — If `app/invoices/[id]/page.tsx` is still co-owned, extract `CollectionNotePanel` before any CCC Task.
5. **CCC coordinator** — Parent chat for Command Center only. Embeds the Owns matrix. Slim collection-note scope. Cursor picks the agent count.
6. **Hook `subagentStart`** — Deny Tasks that claim files owned by A or B, or paths outside CCC Owns.
7. **Gate, then PR** — CCC API tests plus `ledgerly-reviewer`. C opens a ready PR. A’s draft stays open.

## Owns matrix (target after scout)

| Owner | Owns | Must not |
| --- | --- | --- |
| A | `lib/disputes/resolve.ts`, resolve route, `ResolutionPanel` | Invoice page, email, collection note, seed |
| B | `CustomerEmailCard`, email API, invoice mount line for email | Collection note, resolve, validation |
| C | `lib/collection-note.ts`, `POST /api/invoices/[id]/collection-note`, `CollectionNotePanel`, invoice mount line for note | Resolve files, email editor, seed, suggested-credit |

Hard collision until the fence: raw `app/invoices/[id]/page.tsx` claimed by both B and C.

## Automation

| Piece | Role |
| --- | --- |
| **ownership-scout** | Higher-reasoning model. Open PR diffs are the claim. Writes the local matrix. No product code. |
| **`subagentStart` hook** | Enforce the matrix on every Task spawn. |
| **CCC coordinator** | Coordinates CCC agents only. Does not finish A’s resolve or re-land B’s email. |
| **API tests + ledgerly-reviewer** | Product and convention gate. Hooks are not the e2e runner. |

## Slim CCC scope

Enable Save collection note. Persist `Invoice.collectionNote`. No new Prisma models. No Nudge log, payments, customers book, or dashboard KPI.

Catalog only: Starter $49, Growth $99, Scale $249.

## Trade-off

Reviewing B before coding C costs a beat. The dangerous conflict is already in the pull request queue.
