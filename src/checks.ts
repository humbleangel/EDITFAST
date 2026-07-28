import { access, constants } from 'fs/promises'

export const API_KEY_MISSING_MESSAGE =
  'Error: FAST_APPLY_API_KEY not configured.\n\nTo use fast_apply_edit, set the FAST_APPLY_API_KEY environment variable.\nGet your API key at: https://openai.com/api\n\nAlternatively, use the native \'edit\' tool for this change.'

export async function checkFileReady(
  filepath: string,
): Promise<{ ready: true } | { ready: false; error: string }> {
  try {
    await access(filepath, constants.R_OK | constants.W_OK)
    return { ready: true }
  } catch {
    return {
      ready: false,
      error: [
        `Error: File not found or not writable: ${filepath}`,
        '',
        'This tool is for EDITING EXISTING FILES ONLY.',
        "For new file creation, use the 'write' tool instead.",
        '',
        'Example:',
        'write({',
        `  filePath: "${filepath}",`,
        '  content: "your file content here"',
        '})',
      ].join('\n'),
    }
  }
}
