import { useChainId, useChains, useReadContract } from 'wagmi'

import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'

// Reads the on-chain approvers of a UserOp digest (the
// `userOpSigningHash(userOpHash)` owners sign). Mirrors the standard
// request's `useRequestApprovalState` but indexed on the UserOp digest
// rather than the EIP-712 transaction hash.
const useUserOpApprovalState = (multiSigAddress: `0x${string}`, userOpSigningHash: `0x${string}` | undefined) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const enabled = userOpSigningHash != null && userOpSigningHash !== '0x' && multiSigAddress !== '0x'
  const { data, refetch } = useReadContract({
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSigExtended,
    functionName: 'getApprovedOwners',
    args: [userOpSigningHash ?? '0x'],
    query: { enabled, retry: false }
  })
  return {
    approvedOwners: ((data as string[] | undefined) ?? []).map(String),
    refetchApprovals: refetch
  }
}

export default useUserOpApprovalState
