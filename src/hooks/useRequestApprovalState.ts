import { useChainId, useChains, useReadContract } from 'wagmi'
import MyMultiSig from '../constants/abi/MyMultiSig.json'

import { MultiSigTransactionRequest } from '../models/MultiSigs'

// Safe-style hybrid approval state for a request:
// - the EIP-712 transaction hash (via on-chain generateHash, so domain/typehash
//   always match the deployed wallet)
// - owners who pre-approved that hash via approveHash
// - an isValidSignature preflight for the collected calldata
// On wallets older than 0.1.x these functions don't exist; every read fails and
// the UI falls back to the pure off-chain signature flow.
const useRequestApprovalState = (multiSigAddress: `0x${string}`, request: MultiSigTransactionRequest | null) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const base = {
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSig
  }
  const enabled = request != null && multiSigAddress !== '0x'

  const { data: currentNonce } = useReadContract({
    ...base,
    functionName: 'nonce',
    query: { enabled }
  })

  const txnNonce =
    request?.request.txnNonce != null && request.request.txnNonce !== ''
      ? BigInt(request.request.txnNonce)
      : currentNonce != null
        ? BigInt(currentNonce as bigint)
        : undefined

  const hashArgs =
    request != null && txnNonce != null
      ? ([
          request.request.to,
          BigInt(request.request.value || '0'),
          request.request.data,
          BigInt(request.request.txnGas || '0'),
          txnNonce
        ] as const)
      : undefined

  const { data: txHash, isError: hashUnsupported } = useReadContract({
    ...base,
    functionName: 'generateHash',
    args: hashArgs,
    query: { enabled: enabled && hashArgs != null, retry: false }
  })

  const { data: approvedOwners, refetch: refetchApprovals } = useReadContract({
    ...base,
    functionName: 'getApprovedOwners',
    args: [txHash ?? '0x'],
    query: { enabled: txHash != null, retry: false }
  })

  const { data: isValid } = useReadContract({
    ...base,
    functionName: 'isValidSignature',
    args:
      request != null && txnNonce != null
        ? [
            request.request.to,
            BigInt(request.request.value || '0'),
            request.request.data,
            BigInt(request.request.txnGas || '0'),
            txnNonce,
            (request.request.signatures || '0x') as `0x${string}`
          ]
        : undefined,
    query: { enabled: enabled && txnNonce != null, retry: false }
  })

  return {
    // Hybrid approvals exist on MyMultiSig >= 0.1.x only.
    supportsHybrid: txHash != null && !hashUnsupported,
    txHash: txHash as `0x${string}` | undefined,
    approvedOwners: ((approvedOwners as string[] | undefined) ?? []).map(String),
    // undefined while loading/unsupported; boolean once the wallet answered.
    isValid: isValid as boolean | undefined,
    txnNonce,
    refetchApprovals
  }
}

export default useRequestApprovalState
