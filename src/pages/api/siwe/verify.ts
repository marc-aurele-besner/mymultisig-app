import { NextApiRequest, NextApiResponse } from 'next'
import { recoverMessageAddress } from 'viem'
import { parseSiweMessage, validateSiweMessage } from 'viem/siwe'

import { parseBody } from '../../../lib/api/middleware'
import { readNonce, setSession } from '../../../lib/auth/siwe'
import { trackWalletConnected } from '../../../lib/channlize/events'

// Verifies an EIP-4361 (SIWE) message signed by the connected wallet and
// grants an HttpOnly session cookie. EOA signatures only, matching the
// wallet connectors the app ships with.
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  try {
    // Browsers post a raw JSON string; SDK/CLI clients may send application/json.
    const { message, signature } = parseBody<{ message?: unknown; signature?: unknown }>(req)
    if (typeof message !== 'string' || typeof signature !== 'string') {
      return res.status(400).json({ message: 'Missing message or signature' })
    }

    const parsed = parseSiweMessage(message)
    const nonce = readNonce(req)
    if (nonce == null || parsed.nonce !== nonce) {
      return res.status(400).json({ message: 'Invalid or expired nonce' })
    }
    const host = req.headers.host
    if (
      parsed.address == null ||
      !validateSiweMessage({ message: parsed, domain: host ?? parsed.domain, nonce, time: new Date() })
    ) {
      return res.status(400).json({ message: 'Invalid SIWE message' })
    }

    const recovered = await recoverMessageAddress({ message, signature: signature as `0x${string}` })
    if (recovered.toLowerCase() !== parsed.address.toLowerCase()) {
      return res.status(401).json({ message: 'Signature does not match the address' })
    }

    setSession(res, parsed.address)
    await trackWalletConnected({ address: parsed.address })
    return res.status(200).json({ address: parsed.address.toLowerCase() })
  } catch {
    return res.status(400).json({ message: 'Verification failed' })
  }
}

export default handler
