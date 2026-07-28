# EDITFAST

Fast Apply custom tool for OpenCode — 10x faster code editing with lazy edit markers.

## What

`fast_apply_edit` is a custom tool for OpenCode that enables partial-file editing via an OpenAI-compatible Fast Apply API (LM Studio, Ollama, OpenAI). Send 50–500 lines of context with `// ... existing code ...` markers; the tool merges the edit and applies it to the file.

## Installation

```json
// ~/.config/opencode/tools/fast_apply_edit.ts
```

Copy the tool file into your global OpenCode tools directory and set the required environment variables:

```bash
export FAST_APPLY_URL="http://localhost:1234"
export FAST_APPLY_MODEL="fastapply-1.5b"
export FAST_APPLY_API_KEY="your-api-key"
```

## Development

```
npm install
npm test
```

## License

MIT
