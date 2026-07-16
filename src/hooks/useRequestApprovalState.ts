import { useChainId, useChains, useReadContract } from 'wagmi'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'
import { JsonFragment } from '@ethersproject/abi'

import { MultiSigTransactionRequest } from '../models/MultiSigs'
import useWalletType from './useWalletType'
import { isModernWallet } from '../utils/contractVersions'
import { transactionOperation, transactionValidUntil } from '../utils/transactionTypedData'
import { LegacyHashFragments } from '../constants/abi/legacy'

// Safe-style hybrid approval state for a request:
// - the EIP-712 transaction hash (via on-chain generateHash, so domain/typehash
//   always match the deployed wallet)
// - owners who pre-approved that hash via approveHash
// - an isValidSignature preflight for the collected calldata
// The hash/preflight shapes moved twice: pre-0.5.0 wallets bind
// (to, value, data, gas, nonce); 0.5.0 base wallets add validUntil; 0.5.0
// Extended wallets add operation on top (generateHashOp / the 8-arg
// isValidSignature). On wallets older than 0.1.x these functions don't exist;
// every read fails and the UI falls back to the pure off-chain signature flow.
const useRequestApprovalState = (multiSigAddress: `0x${string}`, request: MultiSigTransactionRequest | null) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  // The 0.5.0 package ABI dropped the legacy 5-arg generateHash / 6-arg
  // isValidSignature; vendored fragments keep pre-0.5.0 wallets answerable.
  const base = {
    chainId: chain?.id,
    address: multiSigAddress,
    abi: [...(MyMultiSig as JsonFragment[]), ...(LegacyHashFragments as unknown as JsonFragment[])]
  }
  const extended = {
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSigExtended as JsonFragment[]
  }
  const enabled = request != null && multiSigAddress !== '0x'
  const { walletType, isFetched: walletTypeFetched } = useWalletType(multiSigAddress)

  const { data: currentNonce } = useReadContract({
    ...base,
    functionName: 'nonce',
    query: { enabled }
  })
  const { data: versionData } = useReadContract({
    ...base,
    functionName: 'version',
    query: { enabled }
  })
  const walletVersion = versionData != null ? String(versionData) : undefined
  const modern = isModernWallet(walletVersion)
  const isExtended = walletType === 'extended'
  const shapeKnown = walletVersion != null && walletTypeFetched

  const txnNonce =
    request?.request.txnNonce != null && request.request.txnNonce !== ''
      ? BigInt(request.request.txnNonce)
      : currentNonce != null
        ? BigInt(currentNonce as bigint)
        : undefined

  const validUntil = request != null ? transactionValidUntil(request.request) : 0n
  const operation = request != null ? transactionOperation(request.request) : 0

  const commonArgs =
    request != null && txnNonce != null
      ? ([
          request.request.to,
          BigInt(request.request.value || '0'),
          request.request.data,
          BigInt(request.request.txnGas || '0'),
          txnNonce
        ] as const)
      : undefined

  const hashRead =
    commonArgs == null
      ? { ...base, functionName: 'generateHash', args: undefined }
      : modern && isExtended
        ? { ...extended, functionName: 'generateHashOp', args: [...commonArgs, validUntil, operation] }
        : modern
          ? { ...base, functionName: 'generateHash', args: [...commonArgs, validUntil] }
          : { ...base, functionName: 'generateHash', args: commonArgs }

  const { data: txHash, isError: hashUnsupported } = useReadContract({
    ...hashRead,
    query: { enabled: enabled && hashRead.args != null && shapeKnown, retry: false }
  })

  const { data: approvedOwners, refetch: refetchApprovals } = useReadContract({
    ...base,
    functionName: 'getApprovedOwners',
    args: [txHash ?? '0x'],
    query: { enabled: txHash != null, retry: false }
  })

  const signatures = (request?.request.signatures || '0x') as `0x${string}`
  const isValidRead =
    commonArgs == null
      ? { ...base, functionName: 'isValidSignature', args: undefined }
      : modern && isExtended
        ? { ...extended, functionName: 'isValidSignature', args: [...commonArgs, validUntil, operation, signatures] }
        : modern
          ? { ...base, functionName: 'isValidSignature', args: [...commonArgs, validUntil, signatures] }
          : { ...base, functionName: 'isValidSignature', args: [...commonArgs, signatures] }

  const { data: isValid } = useReadContract({
    ...isValidRead,
    query: { enabled: enabled && isValidRead.args != null && shapeKnown, retry: false }
  })

  return {
    // Hybrid approvals exist on MyMultiSig >= 0.1.x only.
    supportsHybrid: txHash != null && !hashUnsupported,
    txHash: txHash as `0x${string}` | undefined,
    approvedOwners: ((approvedOwners as string[] | undefined) ?? []).map(String),
    // undefined while loading/unsupported; boolean once the wallet answered.
    isValid: isValid as boolean | undefined,
    txnNonce,
    walletVersion,
    refetchApprovals
  }
}

export default useRequestApprovalState
