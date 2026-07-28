export const TOOL_INSTRUCTIONS = `DEFAULT tool for editing existing files. Use INSTEAD of native 'edit' tool.

CRITICAL: For EXISTING files ONLY. Use 'write' for new files.

WORKFLOW:
1. Read the file to understand current content
2. Extract relevant section (50-500 lines with context)
3. Call fast_apply_edit with original_code (partial) and code_edit

PARTIAL EDITING:
- You DON'T need to provide the entire file
- Provide 50-500 lines of context around the area you want to change
- Include 2-5 lines before and after the target section
- Tool will automatically find and replace that section in the file

PRIORITY:
1. fast_apply_edit - ALL file edits (default, 10x faster)
2. edit - Fallback if API fails
3. write - NEW files only

FORMAT:
Use \`// ... existing code ...\` markers for unchanged sections:
\`\`\`
// ... existing code ...
function updated() { return "modified"; }
// ... existing code ...
\`\`\`

RULES:
- MANDATORY: Read file first to get original_code
- Provide 50-500 lines of context (not entire file unless small)
- Use \`// ... existing code ...\` markers in code_edit
- Include 2-5 lines context before/after edits
- Preserve exact indentation and whitespace
- ONE edit block per call (multiple blocks = suboptimal)

EXAMPLE:
\`\`\`typescript
// 1. Read file
const content = await read("src/app.ts", { offset: 100, limit: 50 })

// 2. Call fast_apply_edit with partial context
fast_apply_edit({
  target_filepath: "src/app.ts",
  original_code: content,  // Just 50 lines, not entire file!
  code_edit: "... updated code ..."
})
\`\`\`

FALLBACK: If API fails, use native 'edit' tool.`
