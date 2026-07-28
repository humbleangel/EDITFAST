const escMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

const unescMap: Record<string, string> = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&amp;': '&',
}

export function escapeXmlTags(text: string): string {
  return text.replace(/[&<>"']/g, ch => escMap[ch])
}

export function unescapeXmlTags(text: string): string {
  return text.replace(/&lt;|&gt;|&quot;|&apos;|&amp;/g, match => unescMap[match])
}

const forbiddenTags = ['<updated-code>', '</updated-code>', '<code>', '</code>', '<update>', '</update>']

export function validateNoNestedTags(content: string): void {
  const unescaped = unescapeXmlTags(content)
  for (const tag of forbiddenTags) {
    if (unescaped.includes(tag)) {
      throw new Error(`${tag} tag detected in content`)
    }
  }
}
