# Kick off Cloud Agents from an OpenSpec change

The Cloud Agents API and `@cursor/sdk` have no OpenSpec field. Specs enter as **files in the clone** plus **prompt text**.

Auth: `CURSOR_API_KEY` — personal user key or team **service account**. Team Admin keys are not supported.

Do not use Cursor Plan mode. The prompt should run the OpenSpec loop: `/opsx-explore` then `/opsx-propose` (artifacts only) or `/opsx-apply` when implementing.

```ts
import { Agent } from "@cursor/sdk";

const agent = await Agent.create({
  apiKey: process.env.CURSOR_API_KEY!,
  cloud: {
    repos: [{ url: "https://github.com/joatmon08x/ce-field-demos", startingRef: "main" }],
    autoCreatePR: false,
  },
});

const run = await agent.send(`
/opsx-explore the named Fieldnote change.
Do not use Cursor Plan mode.
When explore is done, /opsx-propose only — no product code.
Read openspec/config.yaml. Catalog is Starter $49, Growth $99, Scale $249.
`);
await run.wait();
```

Apply later with `/opsx-apply` (or fan-out one worker per delta spec). `autoCreatePR: true` is optional. REST: `POST https://api.cursor.com/v1/agents` with the same `prompt.text`.

`/orchestrate` is a plugin. Invoke only when the user types it. Planner writes no code. Human merges. Filter dashboard **Source → SDK**. Commit `openspec/` before Move to Cloud.
