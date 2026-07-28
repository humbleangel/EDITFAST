#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${HOME}/.config/opencode/tools"
TARGET_FILE="${TARGET_DIR}/fast_apply_edit.ts"

mkdir -p "${TARGET_DIR}"

if [ ! -f "src/tool.ts" ]; then
  echo "Error: src/tool.ts not found. Run from the EDITFAST project root." >&2
  exit 1
fi

cp src/tool.ts "${TARGET_FILE}"
echo "Deployed ${TARGET_FILE}"
