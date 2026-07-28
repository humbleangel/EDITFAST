# Changelog

## 0.1.0 — Initial release

- Custom-tool reproduction of `opencode-fast-apply`
- Bypasses OpenCode bugs #33455 and #31354 via custom tools pathway
- Full feature parity with the original plugin
- Supports partial-file editing with `// ... existing code ...` markers
- OpenAI-compatible API client (LM Studio, Ollama, OpenAI)
- XML-escaped prompt construction for safe code transmission
- Unified diff output with change counting and token estimation
- 7 integration test scenarios covering all code paths
