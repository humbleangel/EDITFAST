import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test'
import { callFastApply } from '../src/api'

const originalEnv = { ...process.env }

beforeEach(() => {
  process.env.FAST_APPLY_API_KEY = 'test-key'
  process.env.FAST_APPLY_URL = 'http://test.local/v1'
  process.env.FAST_APPLY_MODEL = 'test-model'
})

afterEach(() => {
  process.env = { ...originalEnv }
  mock.restore()
})

describe('callFastApply', () => {
  test('missing API key returns error without fetch', async () => {
    process.env.FAST_APPLY_API_KEY = 'optional-api-key'
    const result = await callFastApply('original', 'edit')
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('not set')
  })

  test('successful API response returns merged code', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: '<updated-code>merged result</updated-code>' } }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    ) as unknown as typeof fetch

    const result = await callFastApply('original', 'edit')
    expect(result.success).toBe(true)
    if (result.success) expect(result.content).toBe('merged result')
  })

  test('non-2xx response returns error with status', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response('Server Error', { status: 500 })),
    ) as unknown as typeof fetch

    const result = await callFastApply('original', 'edit')
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('500')
  })

  test('parse failure wraps parser error', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: 'no updated-code tags here' } }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    ) as unknown as typeof fetch

    const result = await callFastApply('original', 'edit')
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('Failed to parse')
  })

  test('fetch is called with POST and correct headers', async () => {
    let fetchArgs: unknown[] = []
    globalThis.fetch = mock((...args: unknown[]) => {
      fetchArgs = args
      return Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: '<updated-code>ok</updated-code>' } }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
    }) as unknown as typeof fetch

    await callFastApply('original', 'edit')

    expect(fetchArgs[0]).toBe('http://test.local/v1/chat/completions')
    const opts = fetchArgs[1] as Record<string, unknown>
    expect(opts.method).toBe('POST')
    const headers = opts.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer test-key')
    expect(headers['Content-Type']).toBe('application/json')
  })

  test('code content is XML-escaped in prompt', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: '<updated-code>ok</updated-code>' } }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    ) as unknown as typeof fetch

    const result = await callFastApply('<div>original</div>', '<span>edit</span>')
    expect(result.success).toBe(true)
  })
})
