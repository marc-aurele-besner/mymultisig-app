import { mainnet, polygon, optimism, arbitrum, avalanche, bsc, gnosis, type Chain } from 'viem/chains'

// Fallback gas per wallet type, used until the wallet can estimate the real
// factory call. Each wallet is a full `new MyMultiSig(...)` deployment close
// to the 24 KB code limit, and code deposit alone costs 200 gas per byte
// (about 4.9M gas at the limit), so these are millions, not hundreds of
// thousands. Round approximations, not measurements: the create form replaces
// them with estimateContractGas on the actual call.
export const DEPLOY_GAS_BY_TYPE: Record<'simple' | 'extended' | 'advanced', number> = {
  simple: 4_000_000,
  extended: 5_000_000,
  advanced: 6_000_000
}

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
  // Cost in USD of one unit of gas on this network right now.
  usdPerGas: number
}

// Formats a USD amount for a newcomer: "$12", "$0.45", "under $0.01".
export const formatUsd = (usd: number): string => {
  if (usd < 0.01) return 'under $0.01'
  if (usd < 1) return `$${usd.toFixed(2)}`
  if (usd < 100) return `$${usd.toFixed(usd < 10 ? 2 : 0)}`
  return `$${Math.round(usd).toLocaleString('en-US')}`
}

export const usdPerGas = (gasPriceWei: bigint, coinUsd: number): number => (Number(gasPriceWei) / 1e18) * coinUsd
