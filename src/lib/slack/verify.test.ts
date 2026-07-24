import { createHmac } from 'crypto'

import { verifySlackRequest } from './verify'

// Reference test vectors for verifySlackRequest. The expected behavior
// matches https://api.slack.com/authentication/verifying-requests-from-slack.

const SECRET = 'test_signing_secret_xxxxxxxxxxxxxxxxxxxx'
const RAW_BODY = '{"type":"event_callback","event":{"type":"app_uninstalled"}}'

const makeSignature = (secret: string, timestamp: string, body: string): string =>
  'v0=' + createHmac('sha256', secret).update(`v0:${timestamp}:${body}`).digest('hex')

describe('verifySlackRequest', () => {
  const nowSeconds = Math.floor(Date.now() / 1000)
  const freshTs = String(nowSeconds)
  const staleTs = String(nowSeconds - 600) // 10 min ago, past the 5-min window
  const futureTs = String(nowSeconds + 600)

  const validSignature = makeSignature(SECRET, freshTs, RAW_BODY)

  it('accepts a valid signature within the replay window', () => {
    expect(
      verifySlackRequest({
        signingSecret: SECRET,
        signature: validSignature,
        timestamp: freshTs,
        rawBody: RAW_BODY
      })
    ).toBe(true)
  })

  it('rejects a signature with a wrong secret', () => {
    const bad = makeSignature('wrong_secret', freshTs, RAW_BODY)
    expect(
      verifySlackRequest({
        signingSecret: SECRET,
        signature: bad,
        timestamp: freshTs,
        rawBody: RAW_BODY
      })
    ).toBe(false)
  })

  it('rejects a signature for a different raw body', () => {
    const bad = makeSignature(SECRET, freshTs, '{"different":true}')
    expect(
      verifySlackRequest({
        signingSecret: SECRET,
        signature: bad,
        timestamp: freshTs,
        rawBody: RAW_BODY
      })
    ).toBe(false)
  })

  it('rejects when the timestamp is too old (replay window)', () => {
    const bad = makeSignature(SECRET, staleTs, RAW_BODY)
    expect(
      verifySlackRequest({
        signingSecret: SECRET,
        signature: bad,
        timestamp: staleTs,
        rawBody: RAW_BODY
      })
    ).toBe(false)
  })

  it('rejects when the timestamp is too far in the future', () => {
    const bad = makeSignature(SECRET, futureTs, RAW_BODY)
    expect(
      verifySlackRequest({
        signingSecret: SECRET,
        signature: bad,
        timestamp: futureTs,
        rawBody: RAW_BODY
      })
    ).toBe(false)
  })

  it('rejects a signature missing the v0= prefix', () => {
    const bare = validSignature.slice(3) // strip the v0=
    expect(
      verifySlackRequest({
        signingSecret: SECRET,
        signature: bare,
        timestamp: freshTs,
        rawBody: RAW_BODY
      })
    ).toBe(false)
  })

  it('rejects a malformed (non-numeric) timestamp', () => {
    expect(
      verifySlackRequest({
        signingSecret: SECRET,
        signature: validSignature,
        timestamp: 'not-a-number',
        rawBody: RAW_BODY
      })
    ).toBe(false)
  })

  it('rejects when the signature is undefined or non-string', () => {
    expect(
      verifySlackRequest({
        signingSecret: SECRET,
        signature: undefined,
        timestamp: freshTs,
        rawBody: RAW_BODY
      })
    ).toBe(false)
    expect(
      verifySlackRequest({
        signingSecret: SECRET,
        signature: ['v0=array'],
        timestamp: freshTs,
        rawBody: RAW_BODY
      })
    ).toBe(false)
  })

  it('rejects a signature with a different length (length side-channel guard)', () => {
    // Pad the signature so its length differs from the computed one.
    const padded = validSignature + 'extra'
    expect(
      verifySlackRequest({
        signingSecret: SECRET,
        signature: padded,
        timestamp: freshTs,
        rawBody: RAW_BODY
      })
    ).toBe(false)
  })
})
