// Alchemy network slugs for the chains in networks.ts that Alchemy indexes.
// Chains missing here (mostly deprecated testnets) fall back to native-balance-only
// display in the Assets tab, since enumerating tokens/NFTs needs an indexer.
const alchemyNetworks: Record<number, string> = {
  // Ethereum
  1: 'eth-mainnet',
  11155111: 'eth-sepolia',
  // Polygon
  137: 'polygon-mainnet',
  // Optimism
  10: 'opt-mainnet',
  // Arbitrum
  42161: 'arb-mainnet',
  // Avalanche
  43114: 'avax-mainnet',
  43113: 'avax-fuji',
  // BNB Chain
  56: 'bnb-mainnet',
  // Gnosis
  100: 'gnosis-mainnet'
}

export const alchemyNetworkSlug = (chainId: number): string | undefined => alchemyNetworks[chainId]

export default alchemyNetworks
