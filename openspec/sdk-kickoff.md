# Fully autonomous Cloud Agent on this branch

Linear project: [openspec](https://linear.app/anysphere/project/openspec-05fc3d7dba89) (team `LY`). Git starting ref: `cursor/openspec-resolve-dispute-3068`, not `main`. Do not merge to `main`.

## Backlog (populated from the Fieldnote 201 example)

| Issue | Title |
| --- | --- |
| [LY-6](https://linear.app/anysphere/issue/LY-6) | Dispute dsp_1043 claims $400 against a $249 Scale invoice |
| [LY-7](https://linear.app/anysphere/issue/LY-7) | Overdue / Needs review filter does not change the list |
| [LY-8](https://linear.app/anysphere/issue/LY-8) | Change customer email on invoice detail |

One issue per Cloud Agent run. Catalog: Starter $49, Growth $99, Scale $249.

## Loop

```
Linear Backlog (openspec)
        |
        v
  pick one issue (list_issues project=openspec state=Backlog)
        |
        v
  /opsx-explore     <-- not Cursor /plan
        |
        v
  /opsx-propose     <-- openspec/changes/<id>/
        |
        v
  /opsx-apply       <-- product code against specs
        |
        v
  git push + PR     autoCreatePR, body: Resolves LY-n
        |
        v
  human reviews and merges
```

The Cloud Agents API has no OpenSpec field. The prompt names the Linear issue and this loop. Specs are files in the clone.

## SDK spawn

```ts
import { Agent } from "@cursor/sdk";

const agent = await Agent.create({
  apiKey: process.env.CURSOR_API_KEY!,
  cloud: {
    repos: [{
      url: "https://github.com/joatmon08x/ce-field-demos",
      startingRef: "cursor/openspec-resolve-dispute-3068",
    }],
    autoCreatePR: true,
  },
});

const run = await agent.send(`
You are a fully autonomous Cloud Agent on branch cursor/openspec-resolve-dispute-3068.
Linear project: https://linear.app/anysphere/project/openspec-05fc3d7dba89 (team LY).

1. list_issues on project openspec, state Backlog. Pick the oldest High-priority bug (LY-6 if still Backlog).
2. Move it to In Progress. Do not use Cursor Plan mode.
3. /opsx-explore the issue, then /opsx-propose, then /opsx-apply.
4. Push a PR. PR body must include Resolves {issue id}. Do not merge.
5. Catalog only Starter $49, Growth $99, Scale $249. Do not edit tests/suggested-credit-api.test.ts to force green. Do not correct the $400 claim on dsp_1043.
`);
await run.wait();
```

Auth: `CURSOR_API_KEY` (personal or team service account, not Team Admin). Dashboard filter **Source → SDK**. Linear MCP must be on the Cloud Agent environment. Human still merges.
