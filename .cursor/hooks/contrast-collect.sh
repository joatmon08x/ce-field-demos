#!/bin/bash
# afterFileEdit: flag an edit to the shared color token file.
# Matchers cannot filter by path, and this hook cannot return feedback.
# Anything other than app/globals.css exits with no output and no flag.

input=$(cat || true)
flat=$(printf '%s' "$input" | tr '\n' ' ')

extract() {
  printf '%s' "$flat" | sed -n "s/.*\"$1\"[[:space:]]*:[[:space:]]*\"\\([^\"]*\\)\".*/\\1/p" | head -n 1
}

file_path=$(extract file_path)

case "$file_path" in
  app/globals.css | */app/globals.css) ;;
  *) exit 0 ;;
esac

conversation_id=$(extract conversation_id)
if [ -z "$conversation_id" ]; then
  conversation_id="default"
fi
safe=$(printf '%s' "$conversation_id" | tr -c 'A-Za-z0-9._-' '_')
if [ -z "$safe" ] || [ "$safe" = "." ] || [ "$safe" = ".." ]; then
  safe="default"
fi
generation_id=$(extract generation_id)

flag_dir="${LEDGERLY_CONTRAST_FLAG_DIR:-${TMPDIR:-/tmp}/ledgerly-contrast-flags}"
mkdir -p "$flag_dir" || exit 0
printf '%s\n%s\n' "$generation_id" "$file_path" >"$flag_dir/$safe" || exit 0
exit 0
