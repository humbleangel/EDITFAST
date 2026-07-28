import { describe, test, expect } from 'bun:test'

const cf = (s?: string) => import(`../src/config.ts${s ?? ''}`)

describe('defaults', () => {
  test('FAST_APPLY_API_KEY default', async () => {
    delete process.env.FAST_APPLY_API_KEY
    delete process.env.FAST_APPLY_URL
    delete process.env.FAST_APPLY_MODEL
    const mod = await cf('?defaults-apikey')
    expect(mod.FAST_APPLY_API_KEY()).toBe('optional-api-key')
  })

  test('FAST_APPLY_URL default strips /v1', async () => {
    delete process.env.FAST_APPLY_API_KEY
    delete process.env.FAST_APPLY_URL
    delete process.env.FAST_APPLY_MODEL
    const mod = await cf('?defaults-url')
    expect(mod.FAST_APPLY_URL()).toBe('http://localhost:1234')
  })

  test('FAST_APPLY_MODEL default', async () => {
    delete process.env.FAST_APPLY_API_KEY
    delete process.env.FAST_APPLY_URL
    delete process.env.FAST_APPLY_MODEL
    const mod = await cf('?defaults-model')
    expect(mod.FAST_APPLY_MODEL()).toBe('fastapply-1.5b')
  })
})

describe('env override', () => {
  test('reads API key from env', async () => {
    process.env.FAST_APPLY_API_KEY = 'sk-override'
    const mod = await cf('?env-apikey')
    expect(mod.FAST_APPLY_API_KEY()).toBe('sk-override')
  })

  test('reads URL from env and strips /v1', async () => {
    process.env.FAST_APPLY_URL = 'https://api.example.com/v1'
    const mod = await cf('?env-url')
    expect(mod.FAST_APPLY_URL()).toBe('https://api.example.com')
  })

  test('reads model from env', async () => {
    process.env.FAST_APPLY_MODEL = 'override-model'
    const mod = await cf('?env-model')
    expect(mod.FAST_APPLY_MODEL()).toBe('override-model')
  })
})

describe('URL normalization', () => {
  test('strips trailing /v1', async () => {
    process.env.FAST_APPLY_URL = 'http://localhost:1234/v1'
    const mod = await cf('?url-v1')
    expect(mod.FAST_APPLY_URL()).toBe('http://localhost:1234')
  })

  test('strips trailing /v1/', async () => {
    process.env.FAST_APPLY_URL = 'http://localhost:1234/v1/'
    const mod = await cf('?url-v1-slash')
    expect(mod.FAST_APPLY_URL()).toBe('http://localhost:1234')
  })

  test('preserves URL without /v1 suffix', async () => {
    process.env.FAST_APPLY_URL = 'http://localhost:1234'
    const mod = await cf('?url-plain')
    expect(mod.FAST_APPLY_URL()).toBe('http://localhost:1234')
  })
})

describe('empty env', () => {
  test('empty API key returns default', async () => {
    process.env.FAST_APPLY_API_KEY = ''
    const mod = await cf('?empty-apikey')
    expect(mod.FAST_APPLY_API_KEY()).toBe('optional-api-key')
  })
})
