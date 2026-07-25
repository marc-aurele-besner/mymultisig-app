import { decryptToken, encryptToken } from './crypto'

// crypto.ts reads TELEGRAM_TOKEN_ENCRYPTION_KEY from process.env via
// telegramConfig(). Each test sets up the env var before the module is
// exercised; jest hoists beforeAll, so we mutate process.env directly.
// telegramConfig() requires the key before it returns, so we set it
// (other Telegram env vars don't exist yet — the foundation only
// requires the encryption key).

const KEY_B64 = Buffer.alloc(32, 7).toString('base64') // 32 zero-ish bytes

describe('encryptToken / decryptToken', () => {
  let saved: Record<string, string | undefined> = {}

  beforeAll(() => {
    saved = {
      TELEGRAM_TOKEN_ENCRYPTION_KEY: process.env.TELEGRAM_TOKEN_ENCRYPTION_KEY
    }
    process.env.TELEGRAM_TOKEN_ENCRYPTION_KEY = KEY_B64
  })

  afterAll(() => {
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[name]
      else process.env[name] = value
    }
  })

  it('round-trips a token', () => {
    const token = '123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11'
    const encoded = encryptToken(token)
    expect(decryptToken(encoded)).toBe(token)
  })

  it('produces different ciphertexts for the same plaintext (fresh IV each call)', () => {
    const token = 'stable-plaintext-token'
    const a = encryptToken(token)
    const b = encryptToken(token)
    expect(a).not.toBe(b)
    expect(decryptToken(a)).toBe(token)
    expect(decryptToken(b)).toBe(token)
  })

  it('refuses to decrypt input that is too short to contain IV + authTag', () => {
    // 12 bytes IV + 16 bytes authTag = 28 bytes minimum. 10 bytes is too short.
    const tooShort = Buffer.alloc(10).toString('base64')
    expect(() => decryptToken(tooShort)).toThrow(/too short/i)
  })

  it('refuses to decrypt tampered ciphertext (GCM auth tag mismatch)', () => {
    const token = 'tamper-test-token'
    const encoded = encryptToken(token)
    // Flip a byte in the middle of the ciphertext (skip the IV prefix).
    const buf = Buffer.from(encoded, 'base64')
    buf[buf.length - 5] ^= 0x01
    const tampered = buf.toString('base64')
    expect(() => decryptToken(tampered)).toThrow()
  })
})
