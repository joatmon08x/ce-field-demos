# Hooks

`synthetic-prompt.mjs` blocks a prompt that contains a live credential or an email outside the synthetic `.example` set.

`contrast-collect.sh` and `contrast-check.mjs` check WCAG 4.5:1 contrast for the shared color tokens in `app/globals.css`. Cursor matchers cannot filter by path, and `afterFileEdit` cannot return feedback, so the collect script only writes a flag when that file is edited. The stop hook (`loop_limit` 1, timeouts of a few seconds) exits immediately when no flag is present. When a flagged edit leaves a reading-text pair under 4.5:1, it returns `followup_message` with the pairs. This repo has no CE Demo Builder accessibility library, so `contrastRatio` in `contrast-check.mjs` does the math with no dependencies.
