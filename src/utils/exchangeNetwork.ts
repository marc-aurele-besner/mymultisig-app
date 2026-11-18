import type { Chain } from 'viem'

import networks from '../constants/networks'

export interface ExchangeFunding {
  // Coin to withdraw, e.g. "ETH".
  symbol: string
  // Network name as exchanges usually show it on their withdraw screen.
  network: string
  // Other labels exchanges use for the same network, when common.
  aka: string | null
  // Testnet coins come from a faucet, never from an exchange.
  isTestnet: boolean
}

// Exchanges do not always use the chain's official name: Arbitrum is
// "Arbitrum One", Avalanche needs the C-Chain (not the X-Chain), BNB Chain is
// often "BEP20". Chains not listed fall back to their viem name.
const EXCHANGE_LABELS: Record<number, { network: string; aka?: string }> = {
  1: { network: 'Ethereum', aka: 'ERC20' },
  10: { network: 'Optimism', aka: 'OP Mainnet' },
  56: { network: 'BNB Smart Chain', aka: 'BEP20 / BSC' },
  100: { network: 'Gnosis Chain', aka: 'xDai' },
  137: { network: 'Polygon', aka: 'Polygon PoS' },
  42161: { network: 'Arbitrum One' },
  43114: { network: 'Avalanche C-Chain', aka: 'AVAX C-Chain, not X-Chain' }
}

export const exchangeFunding = (chainOrId: Chain | number | undefined): ExchangeFunding | null => {
  const chain = typeof chainOrId === 'number' ? networks.find((n) => n.id === chainOrId) : chainOrId
  if (chain == null) return null
  const label = EXCHANGE_LABELS[chain.id]
  return {
    symbol: chain.nativeCurrency.symbol,
    network: label?.network ?? chain.name,
    aka: label?.aka ?? null,
    isTestnet: chain.testnet === true
  }
}
