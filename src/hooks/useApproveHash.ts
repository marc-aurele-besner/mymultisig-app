import { useChainId, useChains } from 'wagmi'
import MyMultiSig from '../constants/abi/MyMultiSig.json'

import { useNotification } from './notifications'
import useFinalizeTransaction from './useFinalizeTransaction'

// On-chain pre-approval of a transaction hash (Safe-style approveHash).
// Idempotent per (owner, hash) on the contract side.
const useApproveHash = (multiSigAddress: `0x${string}`, txHash: `0x${string}` | undefined) => {
  const chainId = useChainId(); const chains = useChains(); const chain = chains.find(c => c.id === chainId)
  const { notificationInfo, notificationError, notificationSuccess } = useNotification()
  const config = {
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSig,
    functionName: 'approveHash' as const,
    args: [txHash ?? '0x'] as const
  }
  return useFinalizeTransaction(config, notificationInfo, notificationSuccess, notificationError)
}

export default useApproveHash
