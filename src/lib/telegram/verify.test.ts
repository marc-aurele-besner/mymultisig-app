import { verifyTelegramSecret } from './verify'

// Smoke tests for verifyTelegramSecret. The verifier is just a constant-
// time string compare — the test surface is the input-shape guard rail:
// non-string provided, empty strings, and length mismatch. We do NOT
// check the timing safety itself; that's a Node primitive. Telegram's
// own server-side delivery retries cover the replay window.

const SECRET = 'a-b_c-1234567890ABCDEFG_-_-_-_-_-_'

describe('verifyTelegramSecret', () => {
  it('accepts a matching secret', () => {
    expect(verifyTelegramSecret({ provided: SECRET, expected: SECRET })).toBe(true)
  })

  it('rejects a mismatched secret of equal length', () => {
    const wrong = SECRET.split('').reverse().join('')
    expect(verifyTelegramSecret({ provided: wrong, expected: SECRET })).toBe(false)
  })

  it('rejects an empty provided', () => {
    expect(verifyTelegramSecret({ provided: '', expected: SECRET })).toBe(false)
  })

  it('rejects an empty expected', () => {
    expect(verifyTelegramSecret({ provided: SECRET, expected: '' })).toBe(false)
  })

  it('rejects an undefined provided', () => {
    expect(verifyTelegramSecret({ provided: undefined, expected: SECRET })).toBe(false)
  })

  it('rejects a non-string (array) provided', () => {
    expect(verifyTelegramSecret({ provided: [SECRET], expected: SECRET })).toBe(false)
  })

  it('rejects a shorter provided (length-mismatch guard)', () => {
    // The length guard runs BEFORE timingSafeEqual so a length-mismatch
    // can't trigger the Node throw that would itself leak length.
    expect(verifyTelegramSecret({ provided: SECRET.slice(0, -2), expected: SECRET })).toBe(false)
  })

  it('rejects a longer provided (length-mismatch guard)', () => {
    expect(verifyTelegramSecret({ provided: `${SECRET}xx`, expected: SECRET })).toBe(false)
  })

  it('accepts a multibyte secret round-trip', () => {
    // base64url alphabet + emoji to exercise Buffer.from(...).length !=
    // .length semantic for unicode. Telegram's allowed alphabet is ASCII
    // (A-Za-z0-9_-) so this isn't a real-world case, but the verifier
    // should still work byte-for-byte.
    const multibyte = 'AaZz_-09中文'
    expect(verifyTelegramSecret({ provided: multibyte, expected: multibyte })).toBe(true)
  })
})
