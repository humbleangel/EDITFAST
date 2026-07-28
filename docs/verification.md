# Verification

## Prerequisites

- OpenCode v1.18.9+ installed
- EDITFAST deployed to `~/.config/opencode/tools/fast_apply_edit.ts`

## Steps

### 1. Verify tool registration

```bash
opencode debug tools
```

Expected output includes `fast_apply_edit` in the list of registered tools.

### 2. Verify model awareness

In a fresh OpenCode session, ask:

> What custom tools are available? List them all.

The model should respond with `fast_apply_edit` in its list of available tools.

### 3. Run a real edit (optional)

Provide the model with a test file and ask it to make a change. The model should use `fast_apply_edit` instead of the native `edit` tool.

## Failure investigation

If `fast_apply_edit` does not appear:

1. Verify the file exists at `~/.config/opencode/tools/fast_apply_edit.ts`
2. Check for typos in the filename (must be `fast_apply_edit.ts`)
3. Verify `export default` is present in the file
4. Check OpenCode version — custom tools scanning was verified in v1.18.9 at `packages/opencode/src/tool/registry.ts:174`
5. If OpenCode has regressed on custom tools scanning, bugs #33455 and #31354 may need re-investigation
