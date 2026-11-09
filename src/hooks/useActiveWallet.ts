import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { useAccount, useChainId } from 'wagmi'

import { MultiSig } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'

// The wallet the shell navigation points at: the one in the URL when on a
// /multisig/[address] page, otherwise the last one opened, otherwise the
// first saved wallet on the current network.
const useActiveWallet = (): { wallet: MultiSig | null; wallets: MultiSig[] } => {
  const router = useRouter()
  const chainId = useChainId()
  const { isConnected } = useAccount()
  const { multiSigs, selectedMultiSigAddress } = useMultiSigs()

  return useMemo(() => {
    if (!isConnected) return { wallet: null, wallets: [] }
    const fromUrl = typeof router.query.multisigAddress === 'string' ? router.query.multisigAddress : null
    const wanted = (fromUrl ?? selectedMultiSigAddress ?? '').toLowerCase()
    const onChain = multiSigs.filter((m) => m.chainId === chainId)
    const wallet =
      onChain.find((m) => m.address.toLowerCase() === wanted) ??
      multiSigs.find((m) => m.address.toLowerCase() === wanted) ??
      onChain[0] ??
      null
    return { wallet, wallets: multiSigs }
  }, [isConnected, router.query.multisigAddress, selectedMultiSigAddress, multiSigs, chainId])
}

export default useActiveWallet
