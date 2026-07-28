import {
  describe,
  expect,
  test,
  mock,
  beforeEach,
  afterEach,
} from 'bun:test'
import { mkdtemp, writeFile, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
const originalEnv = { ...process.env }

let tmpDir: string

async function callExecute(args: Record<string, unknown>, ctx: Record<string, unknown>): Promise<string> {
  const m = await import('../src/tool')
  return m.default.execute(args as never, ctx as never) as Promise<string>
}

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'integ-test-'))
  process.env.FAST_APPLY_API_KEY = 'test-key'
  process.env.FAST_APPLY_URL = 'http://test.local/v1'
  process.env.FAST_APPLY_MODEL = 'test-model'
})

afterEach(async () => {
  process.env = { ...originalEnv }
  mock.restore()
  await rm(tmpDir, { recursive: true, force: true })
})

describe('fast_apply_edit integration', () => {
  test('happy path: mock fetch returns success, file is updated', async () => {
    const fp = join(tmpDir, 'test.ts')
    await writeFile(fp, 'const x = 1\nconst y = 2\n')

    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: '<updated-code>const x = 10</updated-code>',
                },
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    ) as unknown as typeof fetch

    const result = await callExecute(
      { target_filepath: fp, original_code: 'const x = 1', code_edit: 'const x = 10' },
      { directory: '' },
    )

    expect(result).toContain('\u2713 Fast Apply complete')
    expect(result).toContain('+1 -1')

    const content = await import('fs/promises').then(m => m.readFile(fp, 'utf-8'))
    expect(content).toContain('const x = 10')
  })

  test('API key missing', async () => {
    process.env.FAST_APPLY_API_KEY = 'optional-api-key'
    const result = await callExecute(
      { target_filepath: 'any.ts', original_code: 'a', code_edit: 'b' },
      { directory: '' },
    )
    expect(result).toContain('FAST_APPLY_API_KEY not configured')
  })

  test('file not found', async () => {
    const result = await callExecute(
      { target_filepath: join(tmpDir, 'nope.ts'), original_code: 'a', code_edit: 'b' },
      { directory: '' },
    )
    expect(result).toContain('File not found or not writable')
  })

  test('API HTTP error', async () => {
    const fp = join(tmpDir, 'test.ts')
    await writeFile(fp, 'const x = 1\n')

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response('Bad Gateway', { status: 502 })),
    ) as unknown as typeof fetch

    const result = await callExecute(
      { target_filepath: fp, original_code: 'const x = 1', code_edit: 'const x = 2' },
      { directory: '' },
    )
    expect(result).toContain('502')
  })

  test('API parse failure (no updated-code tags)', async () => {
    const fp = join(tmpDir, 'test.ts')
    await writeFile(fp, 'const x = 1\n')

    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: 'some garbage response' } }],
          }),
          { status: 200 },
        ),
      ),
    ) as unknown as typeof fetch

    const result = await callExecute(
      { target_filepath: fp, original_code: 'const x = 1', code_edit: 'const x = 2' },
      { directory: '' },
    )
    expect(result).toContain('Failed to parse AI response')
  })

  test('cannot locate original_code', async () => {
    const fp = join(tmpDir, 'test.ts')
    await writeFile(fp, 'const x = 1\n')

    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: '<updated-code>const x = 2</updated-code>' } }],
          }),
          { status: 200 },
        ),
      ),
    ) as unknown as typeof fetch

    const result = await callExecute(
      { target_filepath: fp, original_code: 'const y = 99', code_edit: 'const y = 100' },
      { directory: '' },
    )
    expect(result).toContain('Cannot locate original_code')
  })

  test('multi-occurrence of original_code', async () => {
    const fp = join(tmpDir, 'test.ts')
    await writeFile(fp, 'fn()\nfn()\n')

    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: '<updated-code>fn_updated()</updated-code>' } }],
          }),
          { status: 200 },
        ),
      ),
    ) as unknown as typeof fetch

    const result = await callExecute(
      { target_filepath: fp, original_code: 'fn()', code_edit: 'fn_updated()' },
      { directory: '' },
    )
    expect(result).toContain('appears')
    expect(result).toContain('times')
  })
})
