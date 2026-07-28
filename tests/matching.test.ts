import { describe, expect, test } from 'bun:test'
import { normalizeWhitespace, findExactMatch, findNormalizedMatch } from '../src/matching'

describe('normalizeWhitespace', () => {
  test('CRLF to LF', () => {
    expect(normalizeWhitespace('a\r\nb\r\nc')).toBe('a\nb\nc')
  })
  test('trailing whitespace removed per line', () => {
    expect(normalizeWhitespace('a  \nb  \nc')).toBe('a\nb\nc')
  })
  test('leading and trailing whitespace trimmed', () => {
    expect(normalizeWhitespace('  a\nb  ')).toBe('a\nb')
  })
  test('empty string', () => {
    expect(normalizeWhitespace('')).toBe('')
  })
  test('idempotent', () => {
    const x = '  hello\r\n  world  '
    expect(normalizeWhitespace(normalizeWhitespace(x))).toBe(normalizeWhitespace(x))
  })
})

describe('findExactMatch', () => {
  test('needle at start', () => {
    expect(findExactMatch('hello world', 'hello')).toBe(0)
  })
  test('needle in middle', () => {
    expect(findExactMatch('hello world', 'world')).toBe(6)
  })
  test('needle not present', () => {
    expect(findExactMatch('hello', 'xyz')).toBe(-1)
  })
  test('empty needle returns 0', () => {
    expect(findExactMatch('hello', '')).toBe(0)
  })
  test('empty haystack returns -1 for non-empty needle', () => {
    expect(findExactMatch('', 'a')).toBe(-1)
  })
  test('both empty returns 0', () => {
    expect(findExactMatch('', '')).toBe(0)
  })
})

describe('findNormalizedMatch', () => {
  test('same as exact when already normalized', () => {
    const haystack = 'hello\nworld'
    const needle = 'world'
    expect(findNormalizedMatch(haystack, needle)).toBe(6)
  })
  test('CRLF haystack matches LF needle', () => {
    const haystack = 'hello\r\nworld\r\nfoo'
    const needle = 'world'
    expect(findNormalizedMatch(haystack, needle)).toBe(7)
  })
  test('LF haystack matches CRLF needle', () => {
    const haystack = 'hello\nworld\nfoo'
    const needle = 'world'
    expect(findNormalizedMatch(haystack, needle)).toBe(6)
  })
  test('trailing spaces on lines in haystack', () => {
    const haystack = 'hello  \nworld  \nfoo'
    const needle = 'hello\nworld'
    expect(findNormalizedMatch(haystack, needle)).toBe(0)
  })
  test('return -1 when content differs beyond whitespace', () => {
    const haystack = 'hello\nworld'
    const needle = 'goodbye'
    expect(findNormalizedMatch(haystack, needle)).toBe(-1)
  })
  test('offset points to original (un-normalized) position', () => {
    const haystack = 'ab\r\ncd'
    const needle = 'cd'
    expect(findNormalizedMatch(haystack, needle)).toBe(4)
  })
})
