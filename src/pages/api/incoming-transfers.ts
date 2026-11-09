import { NextApiRequest, NextApiResponse } from 'next'

import { alchemyNetworkSlug } from '../../constants/alchemyNetworks'
import { IncomingTransfersPage, mapAssetTransfers, RawAssetTransfer } from '../../lib/alchemy/transfers'

const FUNCTION = 'incoming-transfers'

// Public chain data keyed by address + chain, so like get-assets this route needs
// no SIWE session; it only keeps the Alchemy key server-side.
const apiKey = process.env.ALCHEMY_API_KEY ?? process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

const PAGE_SIZE = 50

// Block numbers travel as decimal strings so they survive JSON without precision loss.
const isBlockString = (value: unknown): value is string => typeof value === 'string' && /^\d+$/.test(value)
const toHexBlock = (decimal: string) => `0x${BigInt(decimal).toString(16)}`

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Function `%s` invoked', FUNCTION)
  const raw = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { address, chainId, fromBlock, toBlock, pageKey } = (raw ?? {}) as Record<string, unknown>
  if (typeof address !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(address) || typeof chainId !== 'number') {
    return res.status(400).json({ message: 'Invalid address or chainId' })
  }
  if (
    (fromBlock != null && !isBlockString(fromBlock)) ||
    (toBlock != null && !isBlockString(toBlock)) ||
    (pageKey != null && typeof pageKey !== 'string')
  ) {
    return res.status(400).json({ message: 'Invalid block range or page key' })
  }

  const empty: IncomingTransfersPage = { transfers: [], pageKey: null }
  if (apiKey == null || apiKey === '') {
    return res.status(200).json({ message: 'Indexer not configured', content: { ...empty, notConfigured: true } })
  }
  const slug = alchemyNetworkSlug(chainId)
  if (slug === undefined) {
    return res
      .status(200)
      .json({ message: 'Chain not supported by indexer', content: { ...empty, unsupportedChain: true } })
  }

  const params = {
    fromBlock: isBlockString(fromBlock) ? toHexBlock(fromBlock) : '0x0',
    toBlock: isBlockString(toBlock) ? toHexBlock(toBlock) : 'latest',
    toAddress: address,
    // Native ETH arrives as "external"; token transfers as "erc20".
    category: ['external', 'erc20'],
    order: 'desc',
    withMetadata: true,
    maxCount: `0x${PAGE_SIZE.toString(16)}`,
    ...(typeof pageKey === 'string' ? { pageKey } : {})
  }

  const response = await fetch(`https://${slug}.g.alchemy.com/v2/${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'alchemy_getAssetTransfers', params: [params] })
  })
  if (!response.ok) {
    return res.status(502).json({ message: `Transfer lookup failed (${response.status})` })
  }
  const json = await response.json()
  if (json.error != null) {
    return res.status(502).json({ message: String(json.error.message ?? 'Transfer lookup RPC error') })
  }

  const result = (json.result ?? {}) as { transfers?: RawAssetTransfer[]; pageKey?: string }
  const content: IncomingTransfersPage = {
    transfers: mapAssetTransfers(Array.isArray(result.transfers) ? result.transfers : []),
    pageKey: result.pageKey ?? null
  }
  return res.status(200).json({ message: 'Data retrieved', content })
}

export default handler
