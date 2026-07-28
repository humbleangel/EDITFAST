import { unescapeXmlTags, validateNoNestedTags } from './xml'

export function extractUpdatedCode(raw: string): string {
  const trimmed = raw.trim()
  const openMatch = trimmed.match(/<updated-code\s*>/i)
  if (!openMatch) {
    throw new Error('Missing or malformed <updated-code> start tag in AI response')
  }
  const openEnd = openMatch.index! + openMatch[0].length
  const rest = trimmed.slice(openEnd)
  const closeMatch = rest.match(/<\/updated-code\s*>/i)
  if (!closeMatch) {
    throw new Error('Missing or malformed </updated-code> end tag in AI response')
  }
  const content = rest.slice(0, closeMatch.index!)
  const cleaned = content.trim()
  if (!cleaned) {
    throw new Error('Empty updated-code block in AI response')
  }
  const unescaped = unescapeXmlTags(cleaned)
  validateNoNestedTags(unescaped)
  return unescaped
}
