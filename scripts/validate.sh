#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VALIDATOR="${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py"

validate_skill() {
  local skill="$1"
  local dir="$ROOT/skills/$skill"

  if [ ! -d "$dir" ]; then
    echo "missing skill directory: $skill" >&2
    return 1
  fi

  if [ ! -f "$dir/SKILL.md" ]; then
    echo "missing SKILL.md: $dir" >&2
    return 1
  fi

  if [ -f "$VALIDATOR" ]; then
    echo "validating: $skill"
    python3 "$VALIDATOR" "$dir"
  else
    echo "checked: $skill"
  fi
}

if [ "$#" -gt 0 ]; then
  for skill in "$@"; do
    validate_skill "$skill"
  done
else
  while IFS= read -r dir; do
    validate_skill "$(basename "$dir")"
  done < <(find "$ROOT/skills" -mindepth 1 -maxdepth 1 -type d | sort)
fi
