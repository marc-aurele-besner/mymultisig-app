import { NextApiRequest, NextApiResponse } from 'next'
import { isAddress, isHash } from 'viem'

import { parseBody, withSession } from '../../../lib/api/middleware'
import { trackMultisigFunded } from '../../../lib/channlize/events'

// POST /api/events/multisig-funded
// Deposits are plain on-chain transfers made from the browser, so no server
// route sees them. The funding hook reports each confirmed deposit here.
// Session-gated so only a signed-in wallet can report, and the funder is taken
// from the verified session, not the body.
//
// The report is not checked against the chain. Treat the Channlize event as
// "reported by a signed-in wallet" rather than "verified on chain".
const postHandler = withSession(async (req, res, funder) => {
  const body = parseBody(req) as Record<string, unknown>
  const { multiSigAddress, chainId, txHash, asset, tokenAddress, amount } = body

  if (typeof multiSigAddress !== 'string' || !isAddress(multiSigAddress)) {
    return res.status(400).json({ message: 'Invalid multiSigAddress' })
  }
  if (typeof chainId !== 'number' || !Number.isInteger(chainId) || chainId <= 0) {
    return res.status(400).json({ message: 'Invalid chainId' })
  }
  if (typeof txHash !== 'string' || !isHash(txHash)) {
    return res.status(400).json({ message: 'Invalid txHash' })
  }
  if (asset !== 'native' && asset !== 'erc20') {
    return res.status(400).json({ message: 'Invalid asset' })
  }
  if (tokenAddress != null && (typeof tokenAddress !== 'string' || !isAddress(tokenAddress))) {
    return res.status(400).json({ message: 'Invalid tokenAddress' })
  }
  if (amount != null && typeof amount !== 'string') {
    return res.status(400).json({ message: 'Invalid amount' })
  }

  await trackMultisigFunded({
    multiSigAddress,
    chainId,
    txHash,
    asset,
    tokenAddress: typeof tokenAddress === 'string' ? tokenAddress : undefined,
    amount: typeof amount === 'string' ? amount : undefined,
    funder
  })
  return res.status(200).json({ message: 'Funding reported' })
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }
  return postHandler(req, res)
}

export default handler
