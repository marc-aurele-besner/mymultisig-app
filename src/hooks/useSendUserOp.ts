import { useState } from 'react'
import { useChainId, useChains } from 'wagmi'

import { useNotification } from './notifications'
import { MultiSigTransactionRequest, UserOpReceipt } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'
import { patchMultiSigRequest } from '../utils'
import {
  BundlerRpcError,
  estimateUserOperationGas,
  sendUserOperation,
  waitForUserOperationReceipt
} from '../utils/bundler'
import { pmGetPaymasterData } from '../utils/paymaster'
import decodeContractError from '../utils/decodeContractError'
import {
  PackedUserOp,
  packAccountGasLimits,
  packUserOpSignatures,
  unpackAccountGasLimits,
  userOpFromJson,
  userOpToJson
} from '../utils/userOp'
import { toast } from 'sonner'

// Sends a fully-signed UserOp to the bundler. The threshold must already be
// reached (the caller enforces it). The hook tries a paymaster first if
// configured, then eth_estimateUserOperationGas to refine the gas fields,
// then eth_sendUserOperation, then polls eth_getUserOperationReceipt.
//
// All terminal states (success, failure, error) are persisted to Neon +
// Zustand so the request detail view can show the latest state on reload.

type SendResult =
  | { status: 'idle' }
  | { status: 'estimating' }
  | { status: 'sending' }
  | { status: 'submitted'; userOpHash: `0x${string}` }
  | { status: 'polling'; userOpHash: `0x${string}` }
  | { status: 'mined'; userOpHash: `0x${string}`; receipt: UserOpReceipt }
  | { status: 'failed'; reason: string; userOpHash?: `0x${string}`; receipt?: UserOpReceipt }

const useSendUserOp = ({
  request,
  entryPoint,
  bundlerUrl,
  paymasterUrl,
  walletVersion
}: {
  request: MultiSigTransactionRequest
  entryPoint: `0x${string}`
  bundlerUrl: string
  paymasterUrl?: string
  walletVersion: string | undefined
}): { state: SendResult; send: () => Promise<void> } => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { updateMultiSigTransactionRequest } = useMultiSigs()
  const { notificationError } = useNotification()
  const [state, setState] = useState<SendResult>({ status: 'idle' })

  const persisted = (patch: Partial<MultiSigTransactionRequest>) => {
    if (chain == null) return
    const next: MultiSigTransactionRequest = { ...request, ...patch }
    patchMultiSigRequest(request.id, patch).then(() => {
      updateMultiSigTransactionRequest(request.id, next)
    })
  }

  const send = async () => {
    if (request.request.userOpJson == null || request.request.userOpHash == null) {
      setState({ status: 'failed', reason: 'Request is missing the UserOp payload; rebuild and re-sign it.' })
      return
    }
    const baseOp = userOpFromJson(request.request.userOpJson)
    const signature = packUserOpSignatures(walletVersion, request.ownerSigners, request.signatures)
    const op: PackedUserOp = { ...baseOp, signature }

    try {
      setState({ status: 'estimating' })
      toast.info('Estimating UserOp gas...')

      let effectivePaymasterAndData = op.paymasterAndData
      const initialUnpacked = unpackAccountGasLimits(op.accountGasLimits)
      let effectiveVerificationGasLimit = initialUnpacked.verificationGasLimit
      let effectiveCallGasLimit = initialUnpacked.callGasLimit

      if (paymasterUrl != null && paymasterUrl !== '') {
        try {
          const pm = await pmGetPaymasterData(paymasterUrl, { userOp: op, entryPoint })
          effectivePaymasterAndData = pm.paymasterAndData
          if (pm.verificationGasLimit != null) effectiveVerificationGasLimit = BigInt(pm.verificationGasLimit)
          if (pm.callGasLimit != null) effectiveCallGasLimit = BigInt(pm.callGasLimit)
        } catch (pmError) {
          console.warn('paymaster pm_getPaymasterData failed; falling back to wallet deposit', pmError)
        }
      }

      let estimatedOp: PackedUserOp = {
        ...op,
        paymasterAndData: effectivePaymasterAndData,
        accountGasLimits: packAccountGasLimits({
          verificationGasLimit: effectiveVerificationGasLimit.toString(),
          callGasLimit: effectiveCallGasLimit.toString()
        })
      }

      try {
        const estimate = await estimateUserOperationGas(bundlerUrl, estimatedOp, entryPoint)
        const call = BigInt(estimate.callGasLimit)
        const verify = BigInt(estimate.verificationGasLimit)
        const pre = BigInt(estimate.preVerificationGas)
        estimatedOp = {
          ...estimatedOp,
          preVerificationGas: pre,
          accountGasLimits: packAccountGasLimits({
            verificationGasLimit: verify.toString(),
            callGasLimit: call.toString()
          }),
          ...(estimate.paymasterAndData != null ? { paymasterAndData: estimate.paymasterAndData } : {})
        }
      } catch (estimateError) {
        console.warn('Bundler gas estimation failed; sending with the configured defaults', estimateError)
      }

      // Persist the final UserOp payload (sans signature) so a refresh shows
      // the exact op the bundler saw.
      persisted({
        request: { ...request.request, userOpJson: userOpToJson({ ...estimatedOp, signature: '0x' }) }
      })

      setState({ status: 'sending' })
      toast.info('Sending UserOp to the bundler...')
      const userOpHash = await sendUserOperation(bundlerUrl, estimatedOp, entryPoint)
      persisted({ request: { ...request.request, userOpHash } })

      setState({ status: 'submitted', userOpHash })
      setState({ status: 'polling', userOpHash })
      toast.info('Waiting for the bundler to mine the UserOp...')
      const receipt = await waitForUserOperationReceipt(bundlerUrl, userOpHash, { timeout: 180_000 })
      const mapped: UserOpReceipt = {
        userOpHash: receipt.userOpHash,
        txHash: receipt.receipt.transactionHash,
        blockHash: receipt.receipt.blockHash,
        blockNumber: receipt.receipt.blockNumber,
        success: receipt.success,
        ...(receipt.reason != null ? { reason: receipt.reason } : {})
      }
      persisted({
        request: { ...request.request, userOpReceipt: mapped },
        isExecuted: true,
        isSuccessful: receipt.success,
        dateExecuted: new Date().toISOString()
      })

      if (receipt.success) {
        setState({ status: 'mined', userOpHash, receipt: mapped })
      } else {
        const reason = receipt.reason ?? 'The bundler mined the UserOp but the inner call reverted.'
        toast.error('Bundler rejected the UserOp', { description: reason })
        setState({ status: 'failed', reason, userOpHash, receipt: mapped })
      }
    } catch (err) {
      const decoded = decodeContractError(err)
      const reason =
        decoded ??
        (err instanceof BundlerRpcError
          ? `Bundler rejected: ${err.message}`
          : err instanceof Error
            ? err.message
            : 'Send failed')
      console.error('UserOp send failed', err)
      notificationError()
      setState({ status: 'failed', reason })
    }
  }

  return { state, send }
}

// Make the unpacker available for callers that want to inspect the bundled
// gas fields (e.g. the receipt card).
export { unpackAccountGasLimits }

export default useSendUserOp
