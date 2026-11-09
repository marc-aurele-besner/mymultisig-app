import { fallback, http, type Transport } from 'wagmi'
import { createTransport, type EIP1193RequestFn } from 'viem'
import type { Chain } from 'viem/chains'

import { alchemyNetworkSlug } from './alchemyNetworks'
import useRpcConfig from '../states/rpcConfig'

const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
const infuraKey = process.env.NEXT_PUBLIC_INFURA_API_KEY

// Infura subdomains for the chains in networks.ts that Infura serves.
const infuraNetworks: Record<number, string> = {
  1: 'mainnet',
  11155111: 'sepolia',
  137: 'polygon-mainnet',
  10: 'optimism-mainnet',
  42161: 'arbitrum-mainnet',
  43114: 'avalanche-mainnet',
  43113: 'avalanche-fuji'
}

// Keyed endpoints first (higher rate limits), then the chain's public RPC as a
// last resort. Public RPCs alone rate-limit the app quickly.
const rpcUrls = (chainId: number): string[] => {
  const urls: string[] = []
  const alchemySlug = alchemyNetworkSlug(chainId)
  if (alchemyKey && alchemySlug) urls.push(`https://${alchemySlug}.g.alchemy.com/v2/${alchemyKey}`)
  const infuraSlug = infuraNetworks[chainId]
  if (infuraKey && infuraSlug) urls.push(`https://${infuraSlug}.infura.io/v3/${infuraKey}`)
  return urls
}

// JSON-RPC batching folds requests issued in the same tick (receipts, blocks,
// block numbers) into one HTTP call. The cap stays small because several
// public RPCs reject large batches.
const httpOptions = { batch: { batchSize: 10 } } as const

const defaultTransportFor = (chain: Chain): Transport => {
  const keyed = rpcUrls(chain.id).map((url) => http(url, httpOptions))
  // http() with no URL resolves to the chain's default public RPC.
  const publicRpc = http(undefined, httpOptions)
  if (keyed.length === 0) return http(undefined, { ...httpOptions, retryCount: 2, retryDelay: 500 })
  return fallback([...keyed, publicRpc], { retryCount: 2, retryDelay: 500 })
}

// Wraps the default transport so a custom RPC URL the user saved in settings
// (per connected wallet or per open multisig, see states/rpcConfig.ts) is
// resolved on every request. The custom URL goes first, with the default chain
// as a fallback so a flaky custom endpoint does not take the app down.
export const transportFor = (chain: Chain): Transport => {
  const defaultTransport = defaultTransportFor(chain)
  return (params) => {
    const base = defaultTransport(params)
    const custom = new Map<string, ReturnType<Transport>>()
    const pick = (): ReturnType<Transport> => {
      const url = useRpcConfig.getState().resolveRpcUrl(chain.id)
      if (url == null) return base
      let transport = custom.get(url)
      if (transport == null) {
        transport = fallback([http(url, httpOptions), defaultTransport], { retryCount: 2, retryDelay: 500 })(params)
        custom.set(url, transport)
      }
      return transport
    }
    return createTransport({
      key: 'userRpc',
      name: 'User RPC',
      type: 'userRpc',
      // Retries already happen inside the selected transport.
      retryCount: 0,
      request: ((args) => pick().request(args)) as EIP1193RequestFn
    })
  }
}

// viem defaults to polling at most every 4s (half the block time on fast
// chains), which multiplies quickly with receipt waits and event watchers.
// Poll once per block on slow chains and no faster than every 6s elsewhere.
export const pollingIntervalFor = (chain: Chain): number => Math.max(chain.blockTime ?? 12_000, 6_000)
