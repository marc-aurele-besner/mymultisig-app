import { useChainId, useChains } from 'wagmi'
import MyMultiSigExtended from '../constants/abi/MyMultiSigExtended.json'

import { useNotification } from './notifications'
import useFinalizeTransaction from './useFinalizeTransaction'

// Extended wallets only: the delegatee claims an inactive owner's seat.
// This is a direct call from the delegatee's wallet, not a multisig request.
const useTakeOverOwnership = (multiSigAddress: `0x${string}`, inactiveOwner: `0x${string}`) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { notificationInfo, notificationError, notificationSuccess } = useNotification()
  const config = {
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSigExtended,
    functionName: 'takeOverOwnership' as const,
    args: [inactiveOwner] as const
  }
  return useFinalizeTransaction(config, notificationInfo, notificationSuccess, notificationError)
}

export default useTakeOverOwnership
