import { useChainId, useChains } from 'wagmi'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'

import { useNotification } from './notifications'
import useFinalizeTransaction from './useFinalizeTransaction'

// 0.5.0 wallets only: withdraws the connected owner's own on-chain approval
// of a transaction hash without burning the nonce. Self-only — reverts with
// NotApproved() for a hash the owner never approved.
const useRevokeApproval = (multiSigAddress: `0x${string}`, txHash: `0x${string}` | undefined) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { notificationInfo, notificationError, notificationSuccess } = useNotification()
  const config = {
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSig,
    functionName: 'revokeApproval' as const,
    args: [txHash ?? '0x'] as const
  }
  return useFinalizeTransaction(config, notificationInfo, notificationSuccess, notificationError)
}

export default useRevokeApproval
