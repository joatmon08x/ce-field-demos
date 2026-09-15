# Standard bug fix (201 track)

Load from disk: **Customize → Browse Marketplace → Add Marketplace → Import from Disk**, then choose this directory (`plugins/standard-bug-fix`).

Ships:

- Skill `/standard-bug-fix` — match the `ce-field-demos` issue by **title** from `FIELD_DEMO_ISSUES` (example: `/standard-bug-fix Overdue / Needs review filter does not change the list`). Do not key off `LY-003`; on a `LY` team that identifier is the email story.
- Rule: Linear writeback for hypothesis, debug notes, and the fix PR
- Linear MCP at `https://mcp.linear.app/mcp` (authenticate after import)

Linear comments use the Bug Fix Summary template in the skill and rule.
