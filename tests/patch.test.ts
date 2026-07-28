import { describe, expect, test, beforeEach, afterEach } from 'bun:test'
import { mkdtemp, writeFile, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { applyPartialEdit } from '../src/patch'

let tmpDir: string

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'patch-test-'))
})

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true })
})

describe('applyPartialEdit', () => {
  test('exact match replaces section', async () => {
    const fp = join(tmpDir, 'test.txt')
    await writeFile(fp, 'before\nhello\nworld\nafter\n')
    const result = await applyPartialEdit(fp, 'hello\nworld', 'HELLO\nWORLD')
    expect(result.success).toBe(true)
    if (result.success) expect(result.newFileContent).toBe('before\nHELLO\nWORLD\nafter\n')
  })

  test('normalized match handles CRLF', async () => {
    const fp = join(tmpDir, 'crlf.txt')
    await writeFile(fp, 'before\r\nhello\r\nworld\r\nafter\r\n')
    const result = await applyPartialEdit(fp, 'hello\nworld', 'HELLO\nWORLD')
    expect(result.success).toBe(true)
    if (result.success) expect(result.newFileContent).toBe('before\r\nHELLO\nWORLD\r\nafter\r\n')
  })

  test('original_code not present returns error', async () => {
    const fp = join(tmpDir, 'nope.txt')
    await writeFile(fp, 'hello')
    const result = await applyPartialEdit(fp, 'nope', 'replacement')
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('Cannot locate original_code')
  })

  test('original_code appears twice returns error with count', async () => {
    const fp = join(tmpDir, 'twice.txt')
    await writeFile(fp, 'foo\nhello\nbar\nhello\nbaz')
    const result = await applyPartialEdit(fp, 'hello', 'HELLO')
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('appears 2 times')
  })

  test('binary file returns error', async () => {
    const fp = join(tmpDir, 'binary.bin')
    await writeFile(fp, 'hello\x00world')
    const result = await applyPartialEdit(fp, 'hello', 'HELLO')
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('binary')
  })

  test('round-trip: write + apply + read yields same content', async () => {
    const fp = join(tmpDir, 'roundtrip.txt')
    await writeFile(fp, 'line1\nline2\nline3\n')
    const result = await applyPartialEdit(fp, 'line2', 'modified')
    expect(result.success).toBe(true)
    if (result.success) {
      await writeFile(fp, result.newFileContent)
      const content = await import('fs/promises').then(m => m.readFile(fp, 'utf-8'))
      expect(content).toBe('line1\nmodified\nline3\n')
    }
  })

  test('file not found error', async () => {
    const fp = join(tmpDir, 'nonexistent.txt')
    const result = await applyPartialEdit(fp, 'hello', 'world')
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('Cannot read file')
  })
})
