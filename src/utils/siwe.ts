import { createSiweMessage } from 'viem/siwe'

// Client side of the SIWE session. One wallet signature per session (the
// server cookie lasts 7 days); every DB read/write then rides the cookie.

export type SignMessageFn = (args: { message: string }) => Promise<`0x${string}`>

export const fetchSiweSession = async (): Promise<string | null> => {
  try {
    const response = await fetch('/api/siwe/session')
    const data = await response.json()
    return typeof data?.address === 'string' ? data.address : null
  } catch {
    return null
  }
}

let inflight: Promise<boolean> | null = null

// Idempotent: resolves true when a session for `address` exists, prompting
// the wallet for a SIWE signature only when needed. Concurrent callers share
// one attempt so the user never sees duplicate popups.
export const ensureSiweSession = (
  address: string,
  chainId: number,
  signMessageAsync: SignMessageFn
): Promise<boolean> => {
  if (inflight != null) return inflight
  inflight = (async () => {
    try {
      const current = await fetchSiweSession()
      if (current != null && current.toLowerCase() === address.toLowerCase()) return true

      const nonceResponse = await fetch('/api/siwe/nonce')
      const { nonce } = await nonceResponse.json()
      if (typeof nonce !== 'string') return false

      const message = createSiweMessage({
        domain: window.location.host,
        address: address as `0x${string}`,
        statement: 'Sign in to MyMultiSig to prove you own this wallet. This is free and sends no transaction.',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce
      })
      const signature = await signMessageAsync({ message })
      const verifyResponse = await fetch('/api/siwe/verify', {
        method: 'POST',
        body: JSON.stringify({ message, signature })
      })
      return verifyResponse.ok
    } catch {
      // User rejected the signature or the server was unreachable.
      return false
    } finally {
      inflight = null
    }
  })()
  return inflight
}

export const clearSiweSession = async () => {
  try {
    await fetch('/api/siwe/logout', { method: 'POST' })
  } catch {
    // Best-effort; the cookie expires on its own.
  }
}
