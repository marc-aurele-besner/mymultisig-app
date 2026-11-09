import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Custom RPC URLs the user saved to replace the app's public/keyed endpoints.
// Two scopes, both persisted to localStorage (URLs often embed an API key, so
// they never leave the browser):
//   - per connected wallet: one URL per chain, used whenever that wallet is
//     connected and the app talks to that chain;
//   - per multisig: one URL for a single multisig (a multisig lives on one
//     chain), used while that multisig is open. It wins over the wallet URL.
// The transport in constants/rpcTransports.ts resolves the URL on every request
// through resolveRpcUrl(), so changes apply without reloading the page.

type WalletRpcUrls = Record<number, string>

interface RpcConfigState {
  // lowercased wallet address -> chainId -> URL
  byWallet: Record<string, WalletRpcUrls>
  // `${chainId}:${lowercased multisig address}` -> URL
  byMultisig: Record<string, string>
  // Runtime context (not persisted): the connected wallet and open multisig.
  activeAccount: string | null
  activeMultisig: string | null
  setWalletRpcUrl: (wallet: string, chainId: number, url: string | null) => void
  setMultisigRpcUrl: (chainId: number, multisig: string, url: string | null) => void
  setContext: (context: { activeAccount?: string | null; activeMultisig?: string | null }) => void
  resolveRpcUrl: (chainId: number) => string | undefined
}

export const multisigRpcKey = (chainId: number, multisig: string) => `${chainId}:${multisig.toLowerCase()}`

export const parseMultisigRpcKey = (key: string): { chainId: number; multisig: `0x${string}` } | null => {
  const [chainId, multisig] = key.split(':')
  if (chainId == null || multisig == null || !multisig.startsWith('0x')) return null
  return { chainId: Number(chainId), multisig: multisig as `0x${string}` }
}

// Only http(s) endpoints: the transport is built on viem's http().
export const isValidRpcUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

const useRpcConfig = create<RpcConfigState>()(
  persist(
    (set, get) => ({
      byWallet: {},
      byMultisig: {},
      activeAccount: null,
      activeMultisig: null,
      setWalletRpcUrl: (wallet, chainId, url) =>
        set((state) => {
          const key = wallet.toLowerCase()
          const next = { ...state.byWallet[key] }
          if (url == null || url === '') delete next[chainId]
          else next[chainId] = url
          const byWallet = { ...state.byWallet, [key]: next }
          if (Object.keys(next).length === 0) delete byWallet[key]
          return { byWallet }
        }),
      setMultisigRpcUrl: (chainId, multisig, url) =>
        set((state) => {
          const byMultisig = { ...state.byMultisig }
          const key = multisigRpcKey(chainId, multisig)
          if (url == null || url === '') delete byMultisig[key]
          else byMultisig[key] = url
          return { byMultisig }
        }),
      setContext: (context) =>
        set((state) => ({
          activeAccount:
            context.activeAccount !== undefined ? (context.activeAccount?.toLowerCase() ?? null) : state.activeAccount,
          activeMultisig:
            context.activeMultisig !== undefined
              ? (context.activeMultisig?.toLowerCase() ?? null)
              : state.activeMultisig
        })),
      resolveRpcUrl: (chainId) => {
        const { byWallet, byMultisig, activeAccount, activeMultisig } = get()
        if (activeMultisig != null) {
          const url = byMultisig[multisigRpcKey(chainId, activeMultisig)]
          if (url != null) return url
        }
        if (activeAccount != null) return byWallet[activeAccount]?.[chainId]
        return undefined
      }
    }),
    {
      name: 'mymultisig-rpc-config',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ byWallet: state.byWallet, byMultisig: state.byMultisig })
    }
  )
)

export default useRpcConfig
