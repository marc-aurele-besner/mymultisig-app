import { useChainId, useChains } from 'wagmi'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'

import { useNotification } from './notifications'
import useFinalizeTransaction from './useFinalizeTransaction'

// On-chain pre-approval of a UserOp digest. Owners call
// `wallet.approveHash(userOpSigningHash)` to count toward the threshold
// without producing an off-chain signature. Idempotent per (owner, hash).
const useApproveUserOpHash = (multiSigAddress: `0x${string}`, userOpSigningHash: `0x${string}` | undefined) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { notificationInfo, notificationError, notificationSuccess } = useNotification()
  const config = {
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSigExtended,
    functionName: 'approveHash' as const,
    args: [userOpSigningHash ?? '0x'] as const
  }
  return useFinalizeTransaction(config, notificationInfo, notificationSuccess, notificationError)
}

export default useApproveUserOpHash
