import { createTwoFilesPatch } from 'diff'

export function generateUnifiedDiff(
  filepath: string,
  original: string,
  modified: string,
): string {
  const patch = createTwoFilesPatch(
    `a/${filepath}`,
    `b/${filepath}`,
    original,
    modified,
    '',
    '',
    { context: 3 },
  )
  return patch.includes('@@') ? patch : 'No changes detected'
}

export function countChanges(diff: string): { added: number; removed: number } {
  let added = 0
  let removed = 0
  for (const line of diff.split('\n')) {
    if (line.startsWith('+') && !line.startsWith('+++')) added++
    else if (line.startsWith('-') && !line.startsWith('---')) removed++
  }
  return { added, removed }
}
