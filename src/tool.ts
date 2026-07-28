import { tool } from '@opencode-ai/plugin'
import { readFile, writeFile } from 'fs/promises'
import { FAST_APPLY_API_KEY } from './config'
import { TOOL_INSTRUCTIONS } from './instructions'
import { callFastApply } from './api'
import { applyPartialEdit } from './patch'
import { generateUnifiedDiff, countChanges } from './diff'
import { estimateTokens, formatFastApplyResult, formatErrorOutput } from './format'
import { checkFileReady, API_KEY_MISSING_MESSAGE } from './checks'

export default tool({
  description: TOOL_INSTRUCTIONS,
  args: {
    target_filepath: tool.schema
      .string()
      .describe(
        'Path of the file to modify (relative to project root). For existing files only — use write tool for new files.',
      ),
    original_code: tool.schema
      .string()
      .describe(
        "The original code section to be modified. Provide 50-500 lines of context around the section you're changing. Include surrounding lines so the match is unique.",
      ),
    code_edit: tool.schema
      .string()
      .describe(
        "The updated code with changes applied. Use '// ... existing code ...' markers to indicate unchanged sections you're omitting.",
      ),
  },
  async execute(args, context) {
    const { target_filepath, original_code, code_edit } = args
    const directory = (context as Record<string, unknown>)?.directory as string | undefined

    if (!FAST_APPLY_API_KEY() || FAST_APPLY_API_KEY() === 'optional-api-key') {
      return API_KEY_MISSING_MESSAGE
    }

    const isAbsolute = target_filepath.startsWith('/') || /^[A-Za-z]:[/\\]/.test(target_filepath)
    const filepath = isAbsolute
      ? target_filepath
      : `${directory || ''}/${target_filepath}`

    if (!filepath) {
      return formatErrorOutput('No target filepath provided', target_filepath, directory || '')
    }

    const readiness = await checkFileReady(filepath)
    if (!readiness.ready) {
      return readiness.error
    }

    const apiResult = await callFastApply(original_code, code_edit)
    if (!apiResult.success) {
      return formatErrorOutput(apiResult.error, target_filepath, directory || '')
    }

    let originalFileContent: string
    try {
      originalFileContent = await readFile(filepath, 'utf-8')
    } catch (err) {
      return formatErrorOutput(
        `Failed to read file: ${(err as Error).message}`,
        target_filepath,
        directory || '',
      )
    }

    const applyResult = await applyPartialEdit(filepath, original_code, apiResult.content)
    if (!applyResult.success) {
      return formatErrorOutput(applyResult.error, target_filepath, directory || '')
    }

    try {
      await writeFile(filepath, applyResult.newFileContent, 'utf-8')
    } catch (err) {
      return formatErrorOutput(
        `Failed to write file: ${(err as Error).message}`,
        target_filepath,
        directory || '',
      )
    }

    const diff = generateUnifiedDiff(target_filepath, originalFileContent, applyResult.newFileContent)
    const { added, removed } = countChanges(diff)
    const modifiedTokens = estimateTokens(diff)

    return formatFastApplyResult(target_filepath, directory || '', added, removed, diff, modifiedTokens)
  },
})
