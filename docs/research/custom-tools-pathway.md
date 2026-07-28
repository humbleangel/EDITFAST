# Research: Custom Tools Loading Pathway

## Source file

`packages/opencode/src/tool/registry.ts` (lines 172-186)

## How custom tools load

The ToolRegistry scans every config directory for files matching:

```typescript
Glob.scanSync("{tool,tools}/*.{js,ts}", { cwd: dir, absolute: true, dot: true, symlink: true })
```

This covers:
- `~/.config/opencode/tool/` and `~/.config/opencode/tools/`
- `.opencode/tool/` and `.opencode/tools/` in project roots

For each matched file, it:
1. `import()`s the file dynamically
2. Iterates all exports
3. Filters to objects matching `{ args, description, execute }` (the `isPluginTool()` check)
4. For `default` export → tool name = filename
5. For named exports → tool name = `filename_exportname`

## How plugin tools (Hooks.tool) load

Lines 188-193:

```typescript
const plugins = yield* plugin.list()
for (const p of plugins) {
  for (const [id, def] of Object.entries(p.tool ?? {})) {
    custom.push(fromPlugin(id, def))
  }
}
```

Both pathways converge in `fromPlugin()`, which creates a `Tool.Def`.

## Bug #31354 root cause

The `plugin.list()` call returns plugins registered via the V2 plugin system. External plugins loaded from the config `plugin` array or from `{plugin,plugins}/*.{ts,js}` files register via `Hooks.tool` — but the bridge between the SDK's `Hooks.tool` and the internal `Plugin.Service` is broken. The tools never appear in `plugin.list()`.

## Why custom tools bypass the bug

The custom tools pathway (`{tool,tools}/*.{js,ts}` scanning) is **completely independent** of the plugin bridge. It imports files directly from the filesystem and never goes through `plugin.list()`. It bypasses both:
- **Bug #33455**: No reliance on config `plugin` array loading
- **Bug #31354**: No reliance on `Hooks.tool` → `Plugin.Service` bridge

## Result

**Custom tools in `~/.config/opencode/tools/` WILL work on v1.18.9.** The production code and test suite both confirm this.

## Tool context available to custom tools

From the `fromPlugin()` function, custom tools receive:

```typescript
{
  sessionID,
  messageID,
  agent,
  callID,
  directory,
  worktree,
  ask: (req) => Promise<Permission.Response>,
  abort: AbortSignal
}
```

## Reference

- Test: `packages/opencode/test/tool/registry.test.ts` (line 200: "loads tools from .opencode/tools (plural)")
- Production code: `packages/opencode/src/tool/registry.ts` (lines 172-186)
