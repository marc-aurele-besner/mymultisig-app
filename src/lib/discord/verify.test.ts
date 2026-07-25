import { ed25519 } from '@noble/curves/ed25519'

import { verifyDiscordRequest } from './verify'

// Reference test vectors for verifyDiscordRequest. The expected behavior
// matches https://discord.com/developers/docs/interactions/receiving-and-responding#security-and-authorization.
//
// We generate a fresh key pair per test run so the vectors are not
// pinned to a known public key. The signed message is
// `timestamp + rawBody` per the spec, and signatures are 64 bytes
// (128 hex chars).

const RAW_BODY = '{"type":1}'

const makeSigned = (secretKey: Uint8Array, publicKey: Uint8Array, timestamp: string, body: string) => {
  const message = new TextEncoder().encode(timestamp + body)
  const sig = ed25519.sign(message, secretKey)
  return { signature: Buffer.from(sig).toString('hex'), publicKey: Buffer.from(publicKey).toString('hex') }
}

describe('verifyDiscordRequest', () => {
  const nowSeconds = Math.floor(Date.now() / 1000)
  const freshTs = String(nowSeconds)
  const staleTs = String(nowSeconds - 600) // 10 min ago, past the 5-min window
  const futureTs = String(nowSeconds + 600)

  // Generate a key pair once for the valid-case tests. Each negative
  // test mints its own pair so the failures can't accidentally pass
  // because of shared state.
  const validSecret = ed25519.utils.randomSecretKey()
  const validPublic = ed25519.getPublicKey(validSecret)
  const valid = makeSigned(validSecret, validPublic, freshTs, RAW_BODY)

  it('accepts a valid signature within the replay window', () => {
    expect(
      verifyDiscordRequest({
        publicKey: valid.publicKey,
        signature: valid.signature,
        timestamp: freshTs,
        rawBody: RAW_BODY
      })
    ).toBe(true)
  })

  it('rejects a signature produced by a different key', () => {
    const otherSecret = ed25519.utils.randomSecretKey()
    const otherPublic = ed25519.getPublicKey(otherSecret)
    const wrong = makeSigned(otherSecret, otherPublic, freshTs, RAW_BODY)
    expect(
      verifyDiscordRequest({
        publicKey: valid.publicKey,
        signature: wrong.signature,
        timestamp: freshTs,
        rawBody: RAW_BODY
      })
    ).toBe(false)
  })

  it('rejects a signature for a different raw body', () => {
    const wrong = makeSigned(validSecret, validPublic, freshTs, '{"different":true}')
    expect(
      verifyDiscordRequest({
        publicKey: valid.publicKey,
        signature: wrong.signature,
        timestamp: freshTs,
        rawBody: RAW_BODY
      })
    ).toBe(false)
  })

  it('rejects when the timestamp is too old (replay window)', () => {
    const wrong = makeSigned(validSecret, validPublic, staleTs, RAW_BODY)
    expect(
      verifyDiscordRequest({
        publicKey: valid.publicKey,
        signature: wrong.signature,
        timestamp: staleTs,
        rawBody: RAW_BODY
      })
    ).toBe(false)
  })

  it('rejects when the timestamp is too far in the future', () => {
    const wrong = makeSigned(validSecret, validPublic, futureTs, RAW_BODY)
    expect(
      verifyDiscordRequest({
        publicKey: valid.publicKey,
        signature: wrong.signature,
        timestamp: futureTs,
        rawBody: RAW_BODY
      })
    ).toBe(false)
  })

  it('rejects a malformed (non-numeric) timestamp', () => {
    expect(
      verifyDiscordRequest({
        publicKey: valid.publicKey,
        signature: valid.signature,
        timestamp: 'not-a-number',
        rawBody: RAW_BODY
      })
    ).toBe(false)
  })

  it('rejects when the signature is undefined or non-string', () => {
    expect(
      verifyDiscordRequest({
        publicKey: valid.publicKey,
        signature: undefined,
        timestamp: freshTs,
        rawBody: RAW_BODY
      })
    ).toBe(false)
    expect(
      verifyDiscordRequest({
        publicKey: valid.publicKey,
        signature: ['hex-array'],
        timestamp: freshTs,
        rawBody: RAW_BODY
      })
    ).toBe(false)
  })

  it('rejects an empty signature or timestamp', () => {
    expect(
      verifyDiscordRequest({
        publicKey: valid.publicKey,
        signature: '',
        timestamp: freshTs,
        rawBody: RAW_BODY
      })
    ).toBe(false)
    expect(
      verifyDiscordRequest({
        publicKey: valid.publicKey,
        signature: valid.signature,
        timestamp: '',
        rawBody: RAW_BODY
      })
    ).toBe(false)
  })

  it('rejects a signature of the wrong length', () => {
    // ed25519 signatures are always 64 bytes / 128 hex chars. A truncated
    // or padded signature must fail.
    const truncated = valid.signature.slice(0, -2)
    expect(
      verifyDiscordRequest({
        publicKey: valid.publicKey,
        signature: truncated,
        timestamp: freshTs,
        rawBody: RAW_BODY
      })
    ).toBe(false)
  })

  it('rejects a public key of the wrong length', () => {
    // Truncate the public key (32 bytes / 64 hex chars) to 30 bytes.
    const truncatedKey = valid.publicKey.slice(0, -4)
    expect(
      verifyDiscordRequest({
        publicKey: truncatedKey,
        signature: valid.signature,
        timestamp: freshTs,
        rawBody: RAW_BODY
      })
    ).toBe(false)
  })

  it('rejects a public key with non-hex characters', () => {
    // Replace the last two hex chars with non-hex (z, z).
    const dirty = valid.publicKey.slice(0, -2) + 'zz'
    expect(
      verifyDiscordRequest({
        publicKey: dirty,
        signature: valid.signature,
        timestamp: freshTs,
        rawBody: RAW_BODY
      })
    ).toBe(false)
  })

  it('accepts a public key with the 0x prefix', () => {
    // Some Discord docs and CLI tools print the key with a 0x prefix.
    // The verifier should tolerate either shape.
    const prefixed = '0x' + valid.publicKey
    expect(
      verifyDiscordRequest({
        publicKey: prefixed,
        signature: valid.signature,
        timestamp: freshTs,
        rawBody: RAW_BODY
      })
    ).toBe(true)
  })
})
