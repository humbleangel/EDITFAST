import { describe, expect, test } from 'bun:test'
import { escapeXmlTags, unescapeXmlTags, validateNoNestedTags } from '../src/xml'

describe('escapeXmlTags', () => {
  test('escapes &, <, >, ", \'', () => {
    expect(escapeXmlTags('<div>&\'"</div>')).toBe('&lt;div&gt;&amp;&apos;&quot;&lt;/div&gt;')
  })

  test('empty string', () => {
    expect(escapeXmlTags('')).toBe('')
  })

  test('no special chars', () => {
    expect(escapeXmlTags('hello world')).toBe('hello world')
  })
})

describe('unescapeXmlTags', () => {
  test('decodes &lt; to <', () => {
    expect(unescapeXmlTags('&lt;')).toBe('<')
  })

  test('empty string', () => {
    expect(unescapeXmlTags('')).toBe('')
  })

  test('round-trip property for arbitrary strings', () => {
    const cases = [
      '',
      'hello',
      '<div>&\'"</div>',
      'a & b < c > d " e \' f',
      '&amp; &lt; &gt; &quot; &apos;',
      'mixed <stuff> & "things" here',
      'just text',
      '<<<>>>"""\'\'\'&&&',
    ]
    for (const x of cases) {
      expect(unescapeXmlTags(escapeXmlTags(x))).toBe(x)
    }
    const alphabet = String.fromCharCode(...Array.from({ length: 65536 }, (_, i) => i))
    expect(unescapeXmlTags(escapeXmlTags(alphabet))).toBe(alphabet)
  })

  test('&amp; decoded last', () => {
    expect(unescapeXmlTags('&amp;amp;')).toBe('&amp;')
  })
})

describe('validateNoNestedTags', () => {
  test('safe content does not throw', () => {
    expect(() => validateNoNestedTags('safe content')).not.toThrow()
  })

  test('<updated-code>x</updated-code> throws', () => {
    expect(() => validateNoNestedTags('<updated-code>x</updated-code>')).toThrow(
      '<updated-code> tag detected in content',
    )
  })

  test('each forbidden tag triggers a throw', () => {
    for (const tag of ['<code>', '</code>', '<update>', '</update>', '<updated-code>', '</updated-code>']) {
      expect(() => validateNoNestedTags(tag)).toThrow(`${tag} tag detected in content`)
    }
  })

  test('unescaped content is detected after unescape', () => {
    expect(() => validateNoNestedTags('&lt;updated-code&gt;')).toThrow('<updated-code> tag detected in content')
  })
})
