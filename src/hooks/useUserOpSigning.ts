import { useEffect, useState } from 'react'
import { useAccount, useChainId, useChains, useReadContract, useSignMessage } from 'wagmi'
import { v4 } from 'uuid'

import { EntryPointAbi } from '../constants/abi/entryPoint'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'
import { useNotificationError, useNotificationSuccess } from './notifications'
import useMultiSigDetails from './useMultiSigDetails'
import { MultiSigExecTransactionArgs, MultiSigTransactionRequest } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'
import { addMultiSigRequest, patchMultiSigRequest } from '../utils'
import {
  DEFAULT_USEROP_GAS,
  buildPackedUserOp,
  encodeUserOpCallData,
  packUserOpSignatures,
  userOpToJson
} from '../utils/userOp'

// UserOp signing: builds the PackedUserOperation from the request's
// (to, value, data, gas) triple, reads the EntryPoint nonce, computes
// userOpHash + userOpSigningHash, and exposes a `sign()` action that uses
// personal_sign over `userOpSigningHash` (the EIP-191 wrap the wallet's
// `validateUserOp` verifies). Each owner accumulates a vote in the same
// `request.signatures` / `request.ownerSigners` arrays the multisig path
// uses, and the combined signature is the same blob the contract consumes.

const useUserOpSigning = ({
  wallet: walletAddress,
  entryPoint,
  args,
  description,
  existingRequest,
  existingRequestId,
  nonce,
  bundlerUrl,
  paymasterUrl,
  userOpGas = DEFAULT_USEROP_GAS
}: {
  wallet: `0x${string}`
  entryPoint: `0x${string}`
  args: MultiSigExecTransactionArgs
  description: string
  existingRequest?: MultiSigTransactionRequest
  existingRequestId?: string
  nonce: bigint | undefined
  bundlerUrl?: string
  paymasterUrl?: string
  userOpGas?: MultiSigExecTransactionArgs['userOpGas']
}) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { address } = useAccount()
  const { addMultiSigTransactionRequest, updateMultiSigTransactionRequest } = useMultiSigs()
  const { data: multiSigDetails } = useMultiSigDetails(walletAddress, address || '0x')
  const walletVersion = multiSigDetails != null ? String(multiSigDetails[1]) : undefined
  const [dataAdded, setDataAdded] = useState(false)
  const notificationError = useNotificationError('Error signing UserOp', 'There was an error signing the UserOp.')
  const notificationSuccess = useNotificationSuccess('Signed UserOp', 'You signed the UserOp successfully.')

  const ready = nonce != null && entryPoint != null && walletAddress !== '0x'
  const value = isUintOrHex(args.value) ? BigInt(args.value) : 0n
  const callData = ready ? encodeUserOpCallData({ wallet: walletAddress, to: args.to, value, data: args.data }) : '0x'
  const userOp = ready
    ? buildPackedUserOp({
        sender: walletAddress,
        nonce: nonce as bigint,
        callData,
        gas: userOpGas as NonNullable<typeof userOpGas>,
        paymasterAndData: '0x'
      })
    : null

  // userOpHash is the EntryPoint's view-call result and binds the full op;
  // userOpSigningHash is the EIP-191 wrap the wallet returns so owners can
  // personal_sign it via any wallet.
  const { data: userOpHash } = useReadContract({
    chainId: chain?.id,
    address: entryPoint,
    abi: EntryPointAbi,
    functionName: 'getUserOpHash',
    args: [
      userOp
        ? {
            sender: userOp.sender,
            nonce: userOp.nonce,
            initCode: userOp.initCode,
            callData: userOp.callData,
            accountGasLimits: userOp.accountGasLimits,
            preVerificationGas: userOp.preVerificationGas,
            gasFees: userOp.gasFees,
            paymasterAndData: userOp.paymasterAndData,
            signature: userOp.signature
          }
        : {
            sender: '0x0000000000000000000000000000000000000000',
            nonce: 0n,
            initCode: '0x',
            callData: '0x',
            accountGasLimits: '0x0000000000000000000000000000000000000000000000000000000000000000',
            preVerificationGas: 0n,
            gasFees: '0x0000000000000000000000000000000000000000000000000000000000000000',
            paymasterAndData: '0x',
            signature: '0x'
          }
    ],
    query: { enabled: ready, retry: false }
  })
  const { data: userOpSigningHash } = useReadContract({
    chainId: chain?.id,
    address: walletAddress,
    abi: MyMultiSigExtended,
    functionName: 'userOpSigningHash',
    args: [((userOpHash as `0x${string}` | undefined) ?? '0x') as `0x${string}`],
    query: { enabled: userOpHash != null, retry: false }
  })

  const v = isUintOrHex(args.value) ? args.value : '0'
  const g = isUintOrHex(args.txnGas) ? args.txnGas : '0'
  const valueAndGasCheck = v !== '' && g !== ''

  const { data, isError, isPending, isSuccess, error, signMessage, reset } = useSignMessage()

  useEffect(() => {
    if (error) notificationError()
  }, [error, notificationError])

  useEffect(() => {
    if (isSuccess && data) notificationSuccess()
  }, [isSuccess, data, notificationSuccess])

  useEffect(() => {
    if (isSuccess && data && chain && !dataAdded && userOp && userOpHash != null && userOpSigningHash != null) {
      setDataAdded(true)
      const allSigners = existingRequest ? [...existingRequest.ownerSigners, address || '0x'] : [address || '0x']
      const allSignatures = existingRequest ? [...existingRequest.signatures, data || '0x'] : [data || '0x']
      const combined = packUserOpSignatures(walletVersion, allSigners, allSignatures)
      const persistedUserOpJson = existingRequest?.request.userOpJson ?? userOpToJson(userOp)
      const dataToAdd: MultiSigTransactionRequest = existingRequest
        ? {
            ...existingRequest,
            request: {
              ...existingRequest.request,
              signatures: combined,
              mode: 'userop',
              userOpHash: userOpHash as `0x${string}`,
              userOpSigningHash: userOpSigningHash as `0x${string}`,
              userOpJson: { ...persistedUserOpJson, signature: '0x' },
              userOpNonce: persistedUserOpJson.nonce,
              userOpGas: userOpGas as MultiSigExecTransactionArgs['userOpGas'],
              ...(bundlerUrl != null ? { bundlerUrl } : {}),
              ...(paymasterUrl != null ? { paymasterUrl } : {})
            },
            signatures: allSignatures,
            ownerSigners: allSigners as `0x${string}`[]
          }
        : {
            id: v4(),
            multiSigAddress: walletAddress,
            request: {
              ...args,
              signatures: combined,
              mode: 'userop',
              userOpHash: userOpHash as `0x${string}`,
              userOpSigningHash: userOpSigningHash as `0x${string}`,
              userOpJson: { ...persistedUserOpJson, signature: '0x' },
              userOpNonce: persistedUserOpJson.nonce,
              userOpGas: userOpGas as MultiSigExecTransactionArgs['userOpGas'],
              ...(bundlerUrl != null ? { bundlerUrl } : {}),
              ...(paymasterUrl != null ? { paymasterUrl } : {})
            },
            description,
            submitter: address || '0x',
            signatures: [data || '0x'],
            ownerSigners: [address || '0x'],
            dateSubmitted: Date.now().toString(),
            dateExecuted: '',
            isActive: true,
            isExecuted: false,
            isCancelled: false,
            isConfirmed: false,
            isSuccessful: false
          }
      if (existingRequest && existingRequestId)
        patchMultiSigRequest(existingRequestId, dataToAdd).then(() => {
          updateMultiSigTransactionRequest(existingRequest.id, dataToAdd)
        })
      else
        addMultiSigRequest(dataToAdd).then(() => {
          addMultiSigTransactionRequest(dataToAdd)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingRequest, dataAdded, isSuccess, data, walletAddress, address, chain, args, description])

  return {
    isPrepareError: !valueAndGasCheck || !ready || userOpHash == null || userOpSigningHash == null,
    prepareError: !valueAndGasCheck
      ? 'Invalid value or gas'
      : !ready
        ? 'EntryPoint nonce is not yet known'
        : userOpHash == null
          ? 'Could not derive the UserOp hash from the EntryPoint'
          : 'Could not derive the UserOp signing hash from the wallet',
    data,
    isError,
    isPending,
    isSuccess,
    error,
    signMessage: () => {
      // The owners sign the *inner* userOpHash (the 32-byte EntryPoint
      // digest) via personal_sign. The wallet's `userOpSigningHash` is the
      // EIP-191 wrap of that digest, so the resulting signature is over
      // exactly `userOpSigningHash` — which is what `_checkSignatures` in
      // `validateUserOp` recovers from.
      if (ready && userOpHash != null) signMessage({ message: { raw: userOpHash as `0x${string}` } })
    },
    reset,
    // Surfacing the intermediate hashes so the UI can show progress.
    userOpHash: userOpHash as `0x${string}` | undefined,
    userOpSigningHash: userOpSigningHash as `0x${string}` | undefined,
    userOp
  }
}

const isUintOrHex = (value: string | undefined): boolean =>
  value != null && value !== '' && (/^\d+$/.test(value) || /^0x[0-9a-fA-F]+$/.test(value))

export default useUserOpSigning
