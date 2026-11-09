import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useQueryClient } from '@tanstack/react-query'
import { useAccount, useChains } from 'wagmi'
import { toast } from 'sonner'

import useRpcConfig from '../../states/rpcConfig'
import useMultiSigs from '../../states/multiSigs'
import { isRpcError, rpcSettingsHref, RPC_SETTINGS_PATH } from '../../lib/rpc/rpcError'

// Re-show the RPC error toast at most once per minute after it is dismissed.
const TOAST_COOLDOWN_MS = 60_000

// The multisig the current page is about: the /multisig/[address]/* tabs carry
// it in the route, the request detail page relies on the selected multisig.
const useOpenMultisig = (): `0x${string}` | null => {
  const router = useRouter()
  const { selectedMultiSigAddress } = useMultiSigs()
  const { multisigAddress } = router.query
  if (typeof multisigAddress === 'string' && multisigAddress.startsWith('0x') && multisigAddress.length === 42)
    return multisigAddress as `0x${string}`
  if (router.route === '/request/[requestId]') return selectedMultiSigAddress
  return null
}

const chainIdFromQueryKey = (queryKey: readonly unknown[]): number | undefined => {
  const options = queryKey[1]
  if (options == null || typeof options !== 'object') return undefined
  const { chainId } = options as { chainId?: unknown }
  return typeof chainId === 'number' ? chainId : undefined
}

// Feeds the connected wallet and open multisig into the RPC config store (the
// transport reads them to pick a custom RPC URL), and turns failed on-chain
// reads caused by the RPC endpoint into a toast linking to the RPC settings.
const RpcContextSync: React.FC = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const chains = useChains()
  const { address } = useAccount()
  const openMultisig = useOpenMultisig()
  const setContext = useRpcConfig((state) => state.setContext)
  const lastToastAt = useRef(0)
  const latest = useRef({ openMultisig, route: router.pathname, push: router.push, chains })
  latest.current = { openMultisig, route: router.pathname, push: router.push, chains }

  useEffect(() => {
    setContext({ activeAccount: address ?? null, activeMultisig: openMultisig })
  }, [address, openMultisig, setContext])

  useEffect(() => {
    return queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== 'updated' || event.action.type !== 'error') return
      if (!isRpcError(event.action.error)) return
      const { openMultisig, route, push, chains } = latest.current
      if (route === RPC_SETTINGS_PATH) return
      const now = Date.now()
      if (now - lastToastAt.current < TOAST_COOLDOWN_MS) return
      lastToastAt.current = now
      const chainId = chainIdFromQueryKey(event.query.queryKey)
      const chainName = chains.find((c) => c.id === chainId)?.name
      toast.error(`The ${chainName != null ? `${chainName} ` : ''}RPC endpoint is not responding`, {
        id: 'rpc-error',
        description: 'Public RPCs rate limit quickly. Save your own RPC URL to use instead.',
        duration: 10_000,
        action: { label: 'RPC settings', onClick: () => void push(rpcSettingsHref(openMultisig)) }
      })
    })
  }, [queryClient])

  return null
}

export default RpcContextSync
