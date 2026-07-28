export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export function formatTokenCount(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`.replace('.0K', 'K')
  }
  return tokens.toString()
}

export function shortenPath(filePath: string, workingDir: string): string {
  if (filePath === workingDir) return '.'
  const prefix = workingDir + '/'
  if (filePath.startsWith(prefix)) return filePath.slice(prefix.length)
  return filePath
}

export function formatFastApplyResult(
  filePath: string,
  workingDir: string,
  insertions: number,
  deletions: number,
  diffPreview: string,
  modifiedTokens: number,
): string {
  const shortPath = shortenPath(filePath, workingDir)
  const tokenStr = formatTokenCount(modifiedTokens)
  return [
    '\u2713 Fast Apply complete',
    '',
    `File: ${shortPath}`,
    `Changes: +${insertions} -${deletions} (~${tokenStr} tokens)`,
    '',
    'Unified diff:',
    diffPreview,
  ].join('\n')
}

export function formatErrorOutput(error: string, filePath: string, workingDir: string): string {
  const shortPath = shortenPath(filePath, workingDir)
  return [
    `\u2717 Fast Apply failed`,
    '',
    `File: ${shortPath}`,
    `Error: ${error}`,
    '',
    "Fallback: Use native 'edit' tool with exact string matching",
  ].join('\n')
}
