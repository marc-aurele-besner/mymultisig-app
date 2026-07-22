import { useChainId, useChains } from 'wagmi'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'

import { useNotification } from './notifications'
import useFinalizeTransaction from './useFinalizeTransaction'

// Withdraws the connected owner's on-chain approval of a UserOp digest.
// Self-only — the wallet reverts with NotApproved() for a hash the owner
// never approved. 0.5.0 wallets only.
const useRevokeUserOpHash = (multiSigAddress: `0x${string}`, userOpSigningHash: `0x${string}` | undefined) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { notificationInfo, notificationError, notificationSuccess } = useNotification()
  const config = {
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSigExtended,
    functionName: 'revokeApproval' as const,
    args: [userOpSigningHash ?? '0x'] as const
  }
  return useFinalizeTransaction(config, notificationInfo, notificationSuccess, notificationError)
}

export default useRevokeUserOpHash
