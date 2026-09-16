# Kick off Cloud Agents from the OpenSpec change

The Cloud Agents API and `@cursor/sdk` have no OpenSpec field. Specs enter as **files in the clone** plus **prompt text**.

Auth: `CURSOR_API_KEY` — personal user key or team **service account**. Team Admin keys are not supported.

## Plan-only (spec review, no product code)

```ts
import { Agent } from "@cursor/sdk";

const agent = await Agent.create({
  apiKey: process.env.CURSOR_API_KEY!,
  cloud: {
    repos: [{ url: "https://github.com/joatmon08x/ce-field-demos", startingRef: "main" }],
    autoCreatePR: false,
  },
  mode: "plan",
});

const run = await agent.send(`
Read openspec/changes/resolve-dispute/{proposal,design,tasks}.md
and the three delta specs under openspec/changes/resolve-dispute/specs/.
Do not implement product code.
Propose the /multitask dispatch: exactly three isolated workers, one prompt per delta spec,
shared contract from design.md, sequential e2e after helper → API → UI.
`);
await run.wait();
```

## Apply (workers, or one cloud agent if you are not fanning out)

Same `Agent.create`, `mode: "agent"` (or omit mode), `autoCreatePR: true` if you want a PR:

```ts
const run = await agent.send(`
Implement openspec/changes/resolve-dispute.
Parent does not implement if you can fan out: one worker per
specs/dispute-resolution-{helper,api,ui}/spec.md.
Copy design.md shared contract into every worker prompt.
Constraints: no seed edits, no suggested-credit v1→v2, no edits to
tests/suggested-credit-api.test.ts, no invented prices.
dsp_1043 accept stores 24900 cents. Apply helper → API → UI.
Sequential e2e out of npm test. Then ledgerly-reviewer and dispute-verifier.
Human merges. Do not archive.
`);
await run.wait();
```

REST equivalent: `POST https://api.cursor.com/v1/agents` with `prompt.text` set to the same instructions, `repos`, optional `mode: "plan"`.

## `/orchestrate`

Plugin, not built-in. Invoke only when the user types `/orchestrate`. Planner writes no code. Publish three worker tasks from the three delta specs. Name `dispute-verifier`. Split suggested-credit v1→v2 out of this goal.

Dashboard: filter **Source → SDK** for SDK-spawned runs. Uncommitted Desktop files are not in the cloud clone — commit the `openspec/` tree first.
