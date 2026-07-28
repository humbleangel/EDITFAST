export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim()
}

export function findExactMatch(haystack: string, needle: string): number {
  return haystack.indexOf(needle)
}

export function findNormalizedMatch(haystack: string, needle: string): number {
  const normalizedHaystack = normalizeWhitespace(haystack)
  const normalizedNeedle = normalizeWhitespace(needle)
  const normalizedIndex = normalizedHaystack.indexOf(normalizedNeedle)
  if (normalizedIndex === -1) return -1

  let originalIdx = 0
  for (let i = 0; i < normalizedIndex; i++) {
    if (haystack[originalIdx] === '\r' && haystack[originalIdx + 1] === '\n') {
      originalIdx += 2
    } else {
      originalIdx += 1
    }
  }
  return originalIdx
}

export function getNormalizedMatchLength(
  haystack: string,
  needle: string,
  startIndex: number,
): number {
  const normNeedle = normalizeWhitespace(needle)
  let origIdx = startIndex
  for (let i = 0; i < normNeedle.length; i++) {
    if (haystack[origIdx] === '\r' && haystack[origIdx + 1] === '\n') {
      origIdx += 2
    } else {
      origIdx += 1
    }
  }
  return origIdx - startIndex
}
