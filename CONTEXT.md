# EDITFAST Context

## Project

EDITFAST is a custom tool for OpenCode that replicates the functionality of `opencode-fast-apply` as a natively-loaded custom tool, bypassing known plugin loading bugs in OpenCode v1.18.9.

## Core problem

OpenCode v1.18.9 has two unfixed bugs:
1. **#33455** — Plugins from config `plugin[]` array silently not loaded
2. **#31354** — External plugin `Hooks.tool` not bridged to `ToolRegistry`

The custom tools pathway (`~/.config/opencode/tools/`) uses a separate loading mechanism that bypasses both bugs.

## Tool surface

- **Name**: `fast_apply_edit`
- **Args**: `target_filepath`, `original_code`, `code_edit`
- **Backend**: OpenAI-compatible Fast Apply API (LM Studio / Ollama / OpenAI)
- **Returns**: Unified diff of changes + change summary
