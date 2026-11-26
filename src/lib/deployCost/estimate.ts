import { mainnet, polygon, optimism, arbitrum, avalanche, bsc, gnosis, type Chain } from 'viem/chains'

// Gas a factory deployment of a multisig typically uses. A round, slightly
// generous figure: the estimate is for orientation, not for accounting.
export const DEPLOY_GAS_UNITS = BigInt(500_000)

// CoinGecko id of each network's gas coin. Testnets are absent on purpose:
// their coins are free.
export const GAS_COIN_IDS: Record<number, string> = {
  [mainnet.id]: 'ethereum',
  [optimism.id]: 'ethereum',
  [arbitrum.id]: 'ethereum',
  [polygon.id]: 'polygon-ecosystem-token',
  [avalanche.id]: 'avalanche-2',
  [bsc.id]: 'binancecoin',
  [gnosis.id]: 'xdai'
}

export const ESTIMATE_CHAINS: Chain[] = [mainnet, optimism, arbitrum, polygon, avalanche, bsc, gnosis]

export interface DeployCostEntry {
  chainId: number
  name: string
  usd: number
}

// Formats a USD amount for a newcomer: "$12", "$0.45", "under $0.01".
export const formatUsd = (usd: number): string => {
  if (usd < 0.01) return 'under $0.01'
  if (usd < 1) return `$${usd.toFixed(2)}`
  if (usd < 100) return `$${usd.toFixed(usd < 10 ? 2 : 0)}`
  return `$${Math.round(usd).toLocaleString('en-US')}`
}

export const costUsd = (gasPriceWei: bigint, coinUsd: number): number =>
  (Number(gasPriceWei * DEPLOY_GAS_UNITS) / 1e18) * coinUsd
