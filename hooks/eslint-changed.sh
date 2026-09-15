#!/usr/bin/env bash
# stdin: JSON with file_path from afterFileEdit
file=$(jq -r '.file_path')
case "$file" in
  *.ts|*.tsx) npx eslint --fix "$file" ;;
esac