#!/bin/bash
# afterFileEdit: flag an edit to the shared color token file.
# Matchers cannot filter by path, and this hook cannot return feedback.
# JSON.parse reads only the top-level file_path. A file_path key inside edits is ignored.

node --input-type=module -e '
import { writeTokenEditFlag } from "./.cursor/hooks/contrast-check.mjs";

let raw = "";
for await (const chunk of process.stdin) raw += chunk;
let input = {};
try {
  input = raw.trim() ? JSON.parse(raw) : {};
} catch {
  process.exit(0);
}
writeTokenEditFlag(input);
' || exit 0
exit 0
