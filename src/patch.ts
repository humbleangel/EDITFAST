import { readFile } from 'fs/promises'
import { findExactMatch, findNormalizedMatch, getNormalizedMatchLength } from './matching'

export async function applyPartialEdit(
  filepath: string,
  original_code: string,
  merged_code: string,
): Promise<
  { success: true; newFileContent: string } | { success: false; error: string }
> {
  let currentFile: string
  try {
    currentFile = await readFile(filepath, 'utf-8')
  } catch {
    return { success: false, error: `Cannot read file: ${filepath}` }
  }

  if (currentFile.includes('\0')) {
    return { success: false, error: 'Cannot edit binary files' }
  }

  const exactIndex = findExactMatch(currentFile, original_code)
  let isNormalized = false
  let index: number
  let matchLen: number

  if (exactIndex !== -1) {
    index = exactIndex
    matchLen = original_code.length
    const occurrences = currentFile.split(original_code).length - 1
    if (occurrences > 1) {
      return {
        success: false,
        error: `original_code appears ${occurrences} times in ${filepath}. Please provide more context around the section you want to change so the match is unique.`,
      }
    }
  } else {
    index = findNormalizedMatch(currentFile, original_code)
    if (index === -1) {
      return {
        success: false,
        error: [
          `Cannot locate original_code in ${filepath}. The content you provided doesn't match the current file.`,
          'POSSIBLE CAUSES:',
          '  - The file has been modified since you read it',
          '  - Whitespace differences (tabs vs spaces, line endings)',
          '  - You included too much or too little context',
          '  - The file does not exist at the expected path',
          'SOLUTIONS:',
          '  1. Re-read the file to get fresh content',
          '  2. Verify exact whitespace matches the actual file',
          '  3. Provide more context (50-500 lines) around the section you want to change',
          "  4. Use native 'edit' tool for exact string matching",
        ].join('\n'),
      }
    }
    matchLen = getNormalizedMatchLength(currentFile, original_code, index)
  }

  const newFileContent =
    currentFile.substring(0, index) +
    merged_code +
    currentFile.substring(index + matchLen)

  return { success: true, newFileContent }
}
