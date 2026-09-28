---
name: split-prd-into-issues
description: Splits work described in a PRD and an implementation plan into small vertical-slice issues for an issue tracker, using the Humanizing Work story-splitting patterns. Use when the user asks to break a PRD, plan, feature, or epic into issues, tickets, user stories, or backlog items.
---

# Split a PRD and into issues

Turn a PRD into issues a team can prioritize. Each issue is a change in system behavior a user can observe. Method: [The Humanizing Work Guide to Splitting User Stories](https://www.humanizingwork.com/the-humanizing-work-guide-to-splitting-user-stories/).

Draft the issues in the reply. Create them in a tracker only when the user names the tracker and tells you to file.

## Read both before splitting

Read the PRD and the plan in full. Do not split from headings alone.

From the PRD, take the default user, the scenario, goals, non-goals, and each in-scope requirement. From the plan, take closed decisions, constraints, and the files or models a slice will touch.

A requirement that is not valuable on its own is not an issue yet. Combine it with the other pieces until a user could tell the system changed. Splitting a task never produces a story.

Non-goals are not issues. Open questions the plan already answered stay closed. Put that decision on the issue as a constraint. Do not file a ticket to revisit it.

If either document is missing, say so. Split from what exists. Do not invent the why, the user, or a decision the documents do not make.

## Make one slice

A slice is small enough that several like it could finish in one iteration, and testable by watching the product. It cuts through every layer that slice needs (UI, rules, persistence). A schema task, an API task, and a UI task for the same behavior are one issue. Tests for that behavior ride inside it. A "write the tests" issue is a task.

The plan's section list is usually layers or a build order. Use it to find constraints. Do not copy it into the tracker as the issue list.

Who, what, and why:

- **What** is the issue title. Short. Name the behavior.
- **Who** is the PRD's default user. Name someone else only when this slice is not for them.
- **Why** is one sentence tied to a goal in the PRD.

Do not use the "As a / I want / so that" template unless the user asked for it.

## Apply the patterns in order

Stop at the first pattern that yields slices you would actually prioritize separately. If two patterns both fit, pick with the rules in the next section.

1. **Workflow.** Ship the simple path from the first step to the last. Add middle steps, reviews, and exception paths as later issues. Do not file step 1, step 2, step 3 as the split. That sequence cannot be prioritized, and the middle steps have no value alone.
2. **Operations.** "Manage," "administer," or a list of create/read/update/delete is several issues, one operation each.
3. **Business rules.** Same outcome, different rules: one issue per rule. The common case is its own issue.
4. **Data variations.** Ship the simplest data case that is still a complete slice. Later issues add the next variation (locale, geography grain, extra entity). Do not build every variation before anything works.
5. **Data entry.** When the complexity is the interface, ship the plain control first and the richer control as a follow-on. The follow-on is the original story; say that.
6. **Major effort.** The first variation carries the mechanism. File two issues: "one of these" and "the rest, given one exists." Do not file one issue per variation when the later ones are trivial, and do not bake a priority into which variation is first if the documents have not chosen.
7. **Simple / complex.** When the story keeps growing ("what about X?"), the simplest complete version is the issue. Every variation is its own later issue.
8. **Defer a quality.** "Make it work," then "make it fast / secure / scaled," only when the slow or loose version is still usable and the documents still want the stricter bar later. A plan that already chose "on next load" instead of live updates is one issue, not two. Do not call a story done while hiding the unfinished quality bar.
9. **Spike.** Last. Use only when the behavior is clear and the implementation is not, so no earlier pattern can fire. The issue is time-boxed. The Then clause is the questions answered, not a built feature. Stop when they are answered. The build is a separate issue after that.

If none of the nine fit, use the meta-pattern: name the part most likely to surprise (often user behavior or a new integration), list the variations, and keep one complete path through that hard part. Drop the other variations into later issues.

A slice may include a thin stand-in (one hard-coded case, one record type) so it can be tried before later issues. Write the stand-in as a constraint on that issue. Do not file "scaffolding" on its own.

## Choose among splits

Prefer the split that lets someone drop or delay a low-value piece. A split that hides that piece inside every issue is the wrong one.

Prefer slices of similar size. One leftover that is still most of the original story means try again.

If a resulting issue is still too big, run the patterns on it again. If it is already one observable behavior, leave it. Do not split into layers to make the count look small.

When the documents still leave the problem or the solution unknown, write the one or two slices that would teach the most, and stop. List what you refused to enumerate. A full backlog there is false precision.

When the plan already specifies behavior, enumerate every in-scope slice.

## Write the issues

Lead the reply with:

- Default user, and the outcome in one sentence.
- The pattern you used and why the dropped alternative was worse. Name it when that alternative was the plan's headings.
- The first issue to do. It is the simple end-to-end path, or the single path through the hard part.

Then one block per issue, first slice first:

```markdown
### {title}

**Why:** {one sentence from a PRD goal}
**Who:** {only if not the default user}
**Pattern:** {pattern name}

**Acceptance:**
- **Given** {context the plan already fixed}
  **When** {the user acts}
  **Then** {observable outcome}
- **Given** {the edge or failure the plan already decided}
  **When** {the user acts}
  **Then** {observable outcome}

**Constraints:** {plan decisions, files, models, or a stand-in this slice requires}
**Not in this issue:** {variations deferred on purpose}
**Covers:** {requirement ids or plan sections}
```

End with coverage:

- Every in-scope requirement appears in exactly one issue, or in a "not an issue" line (non-goal, constraint on another issue, or left unenumerated because the work is still unknown).
- Decisions you carried forward.
- What you left out so it can be dropped.

Write acceptance only as **Given** / **When** / **Then**. One scenario for the behavior, plus one for each edge or failure the plan already decided. The Then line is something a person can see in the product. Do not add a prose checklist beside the scenarios.

Do not add estimates, assignees, labels, or a tracker id.

## File them

Create tracker issues only after the user accepts the split and names the tracker.

Match the title style of an existing issue in that project when you can read one. Keep acceptance as **Given** / **When** / **Then** even if older issues use another shape. Create one issue per block, in the listed order. Copy **Why**, **Acceptance**, **Constraints**, and **Not in this issue** into the body. Do not add estimates, assignees, or labels they did not ask for.