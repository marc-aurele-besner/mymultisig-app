import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'

import { MultiSig, MultiSigTransactionRequest } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'
import { listMultiSigRequests } from '../utils'

// What a live request needs from the connected account.
//   sign    - the account is an owner and has not signed yet
//   execute - the signature threshold is reached
//   waiting - collecting signatures from the other owners
export type InboxStatus = 'sign' | 'execute' | 'waiting'

export interface InboxItem {
  request: MultiSigTransactionRequest
  wallet: MultiSig
  status: InboxStatus
}

interface InboxValue {
  items: InboxItem[]
  // Live (active, not executed, not cancelled) request count per wallet,
  // keyed by lowercase address.
  pendingByWallet: Record<string, number>
  // True once at least one request was ever seen on any saved wallet.
  hasAnyRequest: boolean
  hasExecutedRequest: boolean
  isLoading: boolean
  refetch: () => void
}

const EMPTY: InboxValue = {
  items: [],
  pendingByWallet: {},
  hasAnyRequest: false,
  hasExecutedRequest: false,
  isLoading: false,
  refetch: () => {}
}

const InboxContext = createContext<InboxValue>(EMPTY)

const isLive = (request: MultiSigTransactionRequest) =>
  request.isActive && !request.isExecuted && !request.isCancelled

// Classifies from the stored wallet record (threshold, owners) and the
// off-chain signature list. On-chain approvals (approveHash) are not counted
// here: reading them needs one multicall per request, which the request
// detail page does. A request approved on-chain can therefore show as
// "waiting" in the inbox while its detail page already says "ready".
export const classifyRequest = (
  request: MultiSigTransactionRequest,
  wallet: MultiSig,
  account: string
): InboxStatus => {
  const me = account.toLowerCase()
  if (request.signatures.length >= wallet.threshold) return 'execute'
  // Wallets deployed before 0.5.0 may have no stored owner list; the user
  // saved the wallet in this browser, so treat them as a signer.
  const isOwner = wallet.owners.length === 0 || wallet.owners.some((o) => o.toLowerCase() === me)
  const hasSigned = (request.ownerSigners ?? []).some((o) => o.toLowerCase() === me)
  return isOwner && !hasSigned ? 'sign' : 'waiting'
}

// Loads the request queue of every multisig saved in this browser and keeps
// one shared copy for the sidebar badges, the mobile tab bar, the command
// palette and the Inbox page.
export const InboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useAccount()
  const { multiSigs, multiSigTransactionRequests } = useMultiSigs()
  const [byWallet, setByWallet] = useState<Record<string, MultiSigTransactionRequest[]>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Same address on several chains is one queue server-side, so fetch once.
  const walletKey = useMemo(
    () => [...new Set(multiSigs.map((m) => m.address.toLowerCase()))].sort().join(','),
    [multiSigs]
  )

  const load = useCallback(async () => {
    if (address == null || walletKey === '') {
      setByWallet({})
      return
    }
    setIsLoading(true)
    try {
      const entries = await Promise.all(
        walletKey.split(',').map(async (wallet) => {
          try {
            const data = (await listMultiSigRequests(wallet)) as { content?: MultiSigTransactionRequest[] }
            return [wallet, Array.isArray(data?.content) ? data.content : []] as const
          } catch {
            return [wallet, [] as MultiSigTransactionRequest[]] as const
          }
        })
      )
      setByWallet(Object.fromEntries(entries))
    } finally {
      setIsLoading(false)
    }
  }, [address, walletKey])

  // Sign / execute / reset / cancel all patch the store's request list, so
  // it doubles as the "something changed" signal.
  useEffect(() => {
    void load()
  }, [load, multiSigTransactionRequests])

  // Other owners act from their own browsers; pick that up on return.
  useEffect(() => {
    const onFocus = () => void load()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [load])

  const value = useMemo<InboxValue>(() => {
    if (address == null) return EMPTY
    const items: InboxItem[] = []
    const pendingByWallet: Record<string, number> = {}
    let hasAnyRequest = false
    let hasExecutedRequest = false
    for (const [walletAddress, requests] of Object.entries(byWallet)) {
      const wallet = multiSigs.find((m) => m.address.toLowerCase() === walletAddress)
      if (wallet == null) continue
      if (requests.length > 0) hasAnyRequest = true
      if (requests.some((r) => r.isExecuted)) hasExecutedRequest = true
      const live = requests.filter(isLive)
      pendingByWallet[walletAddress] = live.length
      for (const request of live) items.push({ request, wallet, status: classifyRequest(request, wallet, address) })
    }
    return { items, pendingByWallet, hasAnyRequest, hasExecutedRequest, isLoading, refetch: () => void load() }
  }, [address, byWallet, multiSigs, isLoading, load])

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>
}

const useInbox = () => useContext(InboxContext)

export default useInbox
