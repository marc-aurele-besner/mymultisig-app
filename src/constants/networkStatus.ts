import multiSigFactories from './multiSigFactory'

export type NetworkStatus = 'active' | 'planned' | 'not-supported'

/*
 * Chains we intend to deploy the factory on. Everything else in the picker
 * (mostly deprecated goerli-era testnets) is not supported.
 */
const PLANNED_CHAIN_IDS = new Set<number>([
  1, // Ethereum
  11155111, // Sepolia
  137, // Polygon
  10, // OP Mainnet
  42161, // Arbitrum One
  43114, // Avalanche
  56, // BNB Smart Chain
  100 // Gnosis
])

export const NETWORK_STATUS_LABEL: Record<NetworkStatus, string> = {
  active: 'active',
  planned: 'planned',
  'not-supported': 'not supported'
}

/* Active = the factory contract is actually deployed there, per the contract package. */
export function getNetworkStatus (chainId: number): NetworkStatus {
  if (multiSigFactories.some((factory) => factory.chainId === chainId)) return 'active'
  if (PLANNED_CHAIN_IDS.has(chainId)) return 'planned'
  return 'not-supported'
}
