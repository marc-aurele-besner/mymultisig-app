import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Per-chain bundler + paymaster URLs the user has configured in the UI. The
// store is persisted to localStorage so the URLs survive reloads; env vars
// (`NEXT_PUBLIC_BUNDLER_URL_<chainId>` / `NEXT_PUBLIC_PAYMASTER_URL_<chainId>`)
// are looked up as a fallback when no override is set.

export type ChainAaConfig = {
  bundlerUrl?: string
  paymasterUrl?: string
}

interface BundlerConfigState {
  perChain: Record<number, ChainAaConfig>
  setConfig: (chainId: number, config: ChainAaConfig) => void
  clearConfig: (chainId: number) => void
  getConfig: (chainId: number) => ChainAaConfig
  // Resolves with env fallback.
  getBundlerUrl: (chainId: number) => string | undefined
  getPaymasterUrl: (chainId: number) => string | undefined
}

const envUrl = (chainId: number, kind: 'bundler' | 'paymaster'): string | undefined => {
  const upper = kind.toUpperCase()
  const perChain = process.env[`NEXT_PUBLIC_${upper}_URL_${chainId}`]
  if (perChain != null && perChain !== '') return perChain
  const generic = process.env[`NEXT_PUBLIC_${upper}_URL`]
  return generic != null && generic !== '' ? generic : undefined
}

const useBundlerConfig = create<BundlerConfigState>()(
  persist(
    (set, get) => ({
      perChain: {},
      setConfig: (chainId, config) =>
        set((state) => ({
          perChain: { ...state.perChain, [chainId]: { ...state.perChain[chainId], ...config } }
        })),
      clearConfig: (chainId) =>
        set((state) => {
          const next = { ...state.perChain }
          delete next[chainId]
          return { perChain: next }
        }),
      getConfig: (chainId) => get().perChain[chainId] ?? {},
      getBundlerUrl: (chainId) => get().perChain[chainId]?.bundlerUrl ?? envUrl(chainId, 'bundler'),
      getPaymasterUrl: (chainId) => get().perChain[chainId]?.paymasterUrl ?? envUrl(chainId, 'paymaster')
    }),
    {
      name: 'mymultisig-aa-config',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export default useBundlerConfig
