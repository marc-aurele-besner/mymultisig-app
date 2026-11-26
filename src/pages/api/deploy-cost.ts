import type { NextApiRequest, NextApiResponse } from 'next'
import { createPublicClient, http } from 'viem'

import { ESTIMATE_CHAINS, GAS_COIN_IDS, costUsd, type DeployCostEntry } from '../../lib/deployCost/estimate'

let cache: { at: number; entries: DeployCostEntry[] } | null = null
const TTL_MS = 2 * 60 * 1000

const load = async (): Promise<DeployCostEntry[]> => {
  const ids = Array.from(new Set(Object.values(GAS_COIN_IDS))).join(',')
  const priceRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
  if (!priceRes.ok) throw new Error('price lookup failed')
  const prices = (await priceRes.json()) as Record<string, { usd?: number }>
  const settled = await Promise.all(
    ESTIMATE_CHAINS.map(async (chain): Promise<DeployCostEntry | null> => {
      try {
        const coinUsd = prices[GAS_COIN_IDS[chain.id]]?.usd
        if (coinUsd == null) return null
        const client = createPublicClient({ chain, transport: http(undefined, { timeout: 5000 }) })
        const gasPrice = await client.getGasPrice()
        return { chainId: chain.id, name: chain.name, usd: costUsd(gasPrice, coinUsd) }
      } catch {
        return null
      }
    })
  )
  return settled.filter((e): e is DeployCostEntry => e != null)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })
  try {
    if (cache == null || Date.now() - cache.at > TTL_MS) cache = { at: Date.now(), entries: await load() }
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600')
    return res.status(200).json({ content: cache.entries })
  } catch {
    return res.status(502).json({ message: 'Estimate unavailable' })
  }
}
