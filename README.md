# EDITFAST

Custom-tool reproduction of `opencode-fast-apply` for OpenCode, bypassing OpenCode bugs [#33455](https://github.com/opencode/opencode/issues/33455) and [#31354](https://github.com/opencode/opencode/issues/31354) via the custom tools pathway.

## Why

The `opencode-fast-apply` plugin relies on OpenCode's plugin system, which has two unfixed bugs in v1.18.9:
- **#33455**: Config-array plugins are not loaded
- **#31354**: `Hooks.tool` is not bridged to `ToolRegistry`

EDITFAST sidesteps both by using OpenCode's custom tools scanning (`{tool,tools}/*.{js,ts}`), which is loaded through a completely separate code path that works correctly. See `docs/research/custom-tools-pathway.md` for the full audit.

## Install

```bash
# Clone and install deps
git clone https://github.com/humbleangel/EDITFAST.git
cd EDITFAST
bun install

# Deploy to OpenCode custom tools directory
bun run install
```

Or manually:
```bash
mkdir -p ~/.config/opencode/tools
cp src/tool.ts ~/.config/opencode/tools/fast_apply_edit.ts
```

Once deployed, restart OpenCode. The tool `fast_apply_edit` will be available.

## Configure

| Var | Default | Description |
|-----|---------|-------------|
| `FAST_APPLY_URL` | `http://localhost:1234/v1` | OpenAI-compatible API base URL |
| `FAST_APPLY_MODEL` | `fastapply-1.5b` | Model name to use |
| `FAST_APPLY_API_KEY` | `optional-api-key` | Bearer token for API authentication |

## Usage

The tool is called automatically by the LLM when editing existing files. It accepts:

- `target_filepath` — path of the file to modify (relative to project root)
- `original_code` — 50–500 lines of context around the section to change
- `code_edit` — the updated code with `// ... existing code ...` markers for omitted sections

### Example

The LLM will structure its call like:
```
fast_apply_edit({
  target_filepath: "src/foo.ts",
  original_code: "function bar() {\n  return 1\n}",
  code_edit: "function bar() {\n  return 42\n}"
})
```

## Troubleshooting

| Error | Cause | Action |
|-------|-------|--------|
| `Cannot locate original_code` | File content doesn't match | Re-read the file and retry |
| `appears N times` | Match is ambiguous | Provide more context lines |
| `FAST_APPLY_API_KEY not configured` | Missing env var | Set `FAST_APPLY_API_KEY` |
| API error (status) | API unavailable or error | Check API server, fall back to native `edit` |
| `Failed to parse AI response` | API returned unexpected format | Check model compatibility |

## Development

```bash
bun install          # Install dependencies
bun test             # Run test suite
bun run typecheck    # TypeScript type checking
bun run install      # Deploy to OpenCode
```

## Limitations

- No TUI notifications — the custom-tool API doesn't provide a `client` object for progress/spinner updates
- Same limitations as the upstream `opencode-fast-apply` plugin
- Requires an OpenAI-compatible API endpoint

## Credits

Design and implementation derived from [tickernelz/opencode-fast-apply](https://github.com/tickernelz/opencode-fast-apply), the original plugin this tool reproduces.

## License

MIT
