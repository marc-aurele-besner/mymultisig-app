import type { Chain } from 'viem'
import {
  arbitrum,
  arbitrumGoerli,
  avalanche,
  avalancheFuji,
  bsc,
  bscTestnet,
  gnosis,
  gnosisChiado,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  sepolia
} from 'viem/chains'
import contractsAddressDeployed from 'mymultisig-contract/contractsAddressDeployed.json'

// Mirrors src/constants/networks.ts in the web app: the chains mymultisig.app
// lists in its network selector.
export const SUPPORTED_CHAINS: readonly Chain[] = [
  mainnet,
  sepolia,
  goerli,
  polygon,
  polygonMumbai,
  optimism,
  optimismGoerli,
  arbitrum,
  arbitrumGoerli,
  avalanche,
  avalancheFuji,
  bsc,
  bscTestnet,
  gnosis,
  gnosisChiado
]

export const getChain = (chainId: number): Chain => {
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId)
  if (chain == null)
    throw new Error(
      `Chain ${chainId} is not supported. Supported chains: ${SUPPORTED_CHAINS.map((c) => `${c.name} (${c.id})`).join(', ')}`
    )
  return chain
}

export type KnownFactory = {
  chainId: number
  network: string
  address: `0x${string}`
  version: string
}

// Official factory deployments published by mymultisig-contract.
export const KNOWN_FACTORIES: readonly KnownFactory[] = (
  contractsAddressDeployed as { chainId: number; network: string; address: string; extra: { factoryVersion: string } }[]
).map((entry) => ({
  chainId: entry.chainId,
  network: entry.network,
  address: entry.address as `0x${string}`,
  version: entry.extra.factoryVersion
}))

// The newest official factory on a chain (highest version), or undefined.
export const defaultFactory = (chainId: number): KnownFactory | undefined =>
  KNOWN_FACTORIES.filter((f) => f.chainId === chainId).sort((a, b) =>
    b.version.localeCompare(a.version, undefined, { numeric: true })
  )[0]

export const explorerAddressUrl = (chainId: number, address: string): string | undefined => {
  const base = SUPPORTED_CHAINS.find((c) => c.id === chainId)?.blockExplorers?.default.url
  return base ? `${base}/address/${address}` : undefined
}

export const explorerTxUrl = (chainId: number, hash: string): string | undefined => {
  const base = SUPPORTED_CHAINS.find((c) => c.id === chainId)?.blockExplorers?.default.url
  return base ? `${base}/tx/${hash}` : undefined
}
