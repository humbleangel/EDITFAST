import { describe, it, expect } from 'bun:test'
import { extractUpdatedCode } from '../src/parser'

describe('extractUpdatedCode', () => {
  it('returns merged code from valid response', () => {
    expect(extractUpdatedCode('<updated-code>merged code</updated-code>')).toBe('merged code')
  })

  it('handles whitespace around tags', () => {
    expect(extractUpdatedCode('  <updated-code>merged code</updated-code>  ')).toBe('merged code')
  })

  it('handles whitespace inside opening tag', () => {
    expect(extractUpdatedCode('<updated-code >merged code</updated-code>')).toBe('merged code')
  })

  it('is case-insensitive', () => {
    expect(extractUpdatedCode('<UPDATED-CODE>merged code</UPDATED-CODE>')).toBe('merged code')
    expect(extractUpdatedCode('<Updated-Code>merged code</Updated-Code>')).toBe('merged code')
  })

  it('handles multiline content', () => {
    expect(extractUpdatedCode('<updated-code>line1\nline2</updated-code>')).toBe('line1\nline2')
  })

  it('throws on missing start tag', () => {
    expect(() => extractUpdatedCode('</updated-code>')).toThrow(
      'Missing or malformed <updated-code> start tag in AI response',
    )
  })

  it('throws on missing end tag', () => {
    expect(() => extractUpdatedCode('<updated-code>content')).toThrow(
      'Missing or malformed </updated-code> end tag in AI response',
    )
  })

  it('throws on empty inner content', () => {
    expect(() => extractUpdatedCode('<updated-code>  </updated-code>')).toThrow(
      'Empty updated-code block in AI response',
    )
  })

  it('unescapes XML entities', () => {
    expect(extractUpdatedCode('<updated-code>a &lt; b &gt; c</updated-code>')).toBe('a < b > c')
  })

  it('unescapes &amp; properly (decoded last)', () => {
    expect(extractUpdatedCode('<updated-code>&amp;amp;</updated-code>')).toBe('&amp;')
  })

  it('throws on nested <updated-code> tag', () => {
    expect(() =>
      extractUpdatedCode('<updated-code><updated-code>nested</updated-code></updated-code>'),
    ).toThrow('<updated-code> tag detected in content')
  })

  it('throws when content contains <code> tag', () => {
    expect(() =>
      extractUpdatedCode('<updated-code>some <code>inline</code> code</updated-code>'),
    ).toThrow('<code> tag detected in content')
  })

  it('throws when content contains <update> tag', () => {
    expect(() =>
      extractUpdatedCode('<updated-code>some <update>text</update></updated-code>'),
    ).toThrow('<update> tag detected in content')
  })
})
