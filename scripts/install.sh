#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${CODEX_HOME:-$HOME/.codex}/skills"

mkdir -p "$TARGET"

install_skill() {
  local skill="$1"
  local src="$ROOT/skills/$skill"
  local dst="$TARGET/$skill"

  if [ ! -f "$src/SKILL.md" ]; then
    echo "skip: $skill does not look like a skill folder" >&2
    return 1
  fi

  mkdir -p "$dst"
  rsync -a --delete --exclude ".git" --exclude ".DS_Store" --exclude "._*" "$src/" "$dst/"
  echo "installed: $skill -> $dst"
}

if [ "$#" -gt 0 ]; then
  for skill in "$@"; do
    install_skill "$skill"
  done
else
  while IFS= read -r dir; do
    install_skill "$(basename "$dir")"
  done < <(find "$ROOT/skills" -mindepth 1 -maxdepth 1 -type d | sort)
fi
