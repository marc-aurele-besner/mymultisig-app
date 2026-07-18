import { useEffect } from 'react'
import { useChainId, useChains, useReadContracts } from 'wagmi'
import type { Abi } from 'viem'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'

import { WalletType } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'

// Detects whether a deployed wallet is a MyMultiSig or MyMultiSigExtended by
// probing two functions in a single multicall:
//   1. version() — works on BOTH variants, so a revert here means the address
//      isn't a wallet at all (a real RPC error, not a "simple wallet")
//   2. allowOnlyOwnerRequest() — only on the Extended variant; a revert here
//      is the "this is a simple wallet" signal
//
// Pre-fix this hook relied on a single useReadContract with retry:false, so any
// transient RPC failure during a page refresh would lock the wallet in as
// 'simple' for the rest of the session and hide every Extended-only panel
// until the user refreshed again. Now we wait for both probes to settle, retry
// a couple times on cold-start RPC flakiness, and fall back to the walletType
// already persisted in the multiSigs store (set by ImportConfirmationCard or a
// prior live detection). A confident live detection also writes back into the
// store so a refresh later (or another tab) starts from the right answer.
const useWalletType = (multiSigAddress: `0x${string}`) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { multiSigs, updateMultiSig } = useMultiSigs()
  const stored = multiSigs.find((m) => m.address.toLowerCase() === multiSigAddress.toLowerCase())
  const storedType = stored?.walletType

  const { data } = useReadContracts({
    contracts: [
      {
        chainId: chain?.id,
        address: multiSigAddress,
        abi: MyMultiSig as Abi,
        functionName: 'version'
      },
      {
        chainId: chain?.id,
        address: multiSigAddress,
        abi: MyMultiSigExtended as Abi,
        functionName: 'allowOnlyOwnerRequest'
      }
    ],
    allowFailure: true,
    query: {
      enabled: multiSigAddress !== '0x',
      // Tolerate a couple of cold-start RPC failures before we commit a verdict;
      // a transient error must not flip the wallet to 'simple'.
      retry: 2,
      retryDelay: 800,
      staleTime: 30_000
    }
  })

  const versionProbe = data?.[0]
  const extendedProbe = data?.[1]

  const settled =
    versionProbe != null &&
    (versionProbe.status === 'success' || versionProbe.status === 'failure') &&
    extendedProbe != null &&
    (extendedProbe.status === 'success' || extendedProbe.status === 'failure')

  const liveType: WalletType | undefined = (() => {
    if (!settled) return undefined
    if (versionProbe.status === 'failure') return undefined
    return extendedProbe.status === 'success' ? 'extended' : 'simple'
  })()

  // Mirror a confident live detection into the store so the next page load
  // doesn't re-run the race that triggered this bug. Skipped when the stored
  // value already matches to avoid an extra re-render.
  useEffect(() => {
    if (liveType != null && liveType !== storedType) {
      updateMultiSig(multiSigAddress, { walletType: liveType })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveType, storedType, multiSigAddress])

  // Authoritative answer: prefer a confident live read, otherwise surface the
  // persisted value (undefined when nothing is known yet). Treating "uncertain"
  // as "extended" would create a new bug when the contract really is simple,
  // so consumers gate on isFetched when they need a strict verdict.
  const walletType: WalletType | undefined = liveType ?? storedType

  return {
    walletType,
    allowOnlyOwnerRequest: walletType === 'extended' ? Boolean(extendedProbe?.result) : false,
    isFetched: settled
  }
}

export default useWalletType
