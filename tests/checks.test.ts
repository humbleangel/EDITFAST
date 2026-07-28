import { describe, expect, test, beforeEach, afterEach } from 'bun:test'
import { mkdtemp, writeFile, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { checkFileReady, API_KEY_MISSING_MESSAGE } from '../src/checks'

let tmpDir: string

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'checks-test-'))
})

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true })
})

describe('checkFileReady', () => {
  test('existing writable file returns ready', async () => {
    const fp = join(tmpDir, 'ready.txt')
    await writeFile(fp, 'test')
    const result = await checkFileReady(fp)
    expect(result.ready).toBe(true)
  })

  test('non-existent file returns not ready', async () => {
    const fp = join(tmpDir, 'nope.txt')
    const result = await checkFileReady(fp)
    expect(result.ready).toBe(false)
    if (!result.ready) expect(result.error).toContain('File not found or not writable')
  })

  test('error message includes write tool hint', async () => {
    const fp = join(tmpDir, 'missing.txt')
    const result = await checkFileReady(fp)
    expect(result.ready).toBe(false)
    if (!result.ready) {
      expect(result.error).toContain("'write' tool")
      expect(result.error).toContain(fp)
    }
  })
})

describe('API_KEY_MISSING_MESSAGE', () => {
  test('contains expected text', () => {
    expect(API_KEY_MISSING_MESSAGE).toContain('FAST_APPLY_API_KEY not configured')
    expect(API_KEY_MISSING_MESSAGE).toContain('fast_apply_edit')
    expect(API_KEY_MISSING_MESSAGE).toContain('https://openai.com/api')
  })
})
