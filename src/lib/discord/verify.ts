import { ed25519 } from '@noble/curves/ed25519'

// Verifies the X-Signature-Ed25519 / X-Signature-Timestamp pair on inbound
// interactions from Discord. See
// https://discord.com/developers/docs/interactions/receiving-and-responding#security-and-authorization.
//
// - Public key is the hex-encoded Ed25519 verification key from the
//   Discord application's General Information page. No 0x prefix.
// - The signed message is `timestamp + rawBody` (concatenated, not JSON).
// - The signature is hex-encoded (64 bytes → 128 hex chars).
// - @noble/curves/ed25519.verify returns boolean. We catch any thrown
//   error and surface it as a failed verify so callers can stay simple.

export interface DiscordVerifyInput {
  publicKey: string
  signature: string | string[] | undefined
  timestamp: string | string[] | undefined
  rawBody: string
}

const hexToBytes = (hex: string): Uint8Array | null => {
  // Reject odd-length input, non-hex chars, and the 0x prefix that some
  // keys arrive with. Ed25519 keys are always 32 bytes (64 hex chars).
  if (hex.length === 0 || hex.length % 2 !== 0) return null
  if (hex.length === 2 && hex.toLowerCase() === '0x') return null
  const cleaned = hex.startsWith('0x') || hex.startsWith('0X') ? hex.slice(2) : hex
  if (cleaned.length === 0 || cleaned.length % 2 !== 0) return null
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) return null
  const out = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

export const verifyDiscordRequest = ({ publicKey, signature, timestamp, rawBody }: DiscordVerifyInput): boolean => {
  if (typeof signature !== 'string' || typeof timestamp !== 'string') return false
  if (signature === '' || timestamp === '') return false

  // Discord does not enforce a replay window server-side, but the
  // timestamp is part of the signed message — a stale or future-signed
  // payload is still cryptographically valid. Reject anything more than
  // 5 minutes off so a leaked signature can't be replayed indefinitely.
  const ts = Number(timestamp)
  if (!Number.isFinite(ts)) return false
  const skew = Math.abs(Math.floor(Date.now() / 1000) - ts)
  if (skew > 300) return false

  const pubKeyBytes = hexToBytes(publicKey)
  const sigBytes = hexToBytes(signature)
  if (pubKeyBytes == null || sigBytes == null) return false
  if (pubKeyBytes.length !== 32) return false
  if (sigBytes.length !== 64) return false

  const message = new TextEncoder().encode(timestamp + rawBody)
  try {
    return ed25519.verify(sigBytes, message, pubKeyBytes)
  } catch {
    return false
  }
}
