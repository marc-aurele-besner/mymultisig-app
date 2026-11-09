import { useEffect, useRef } from 'react'
import { parseEventLogs, type Abi } from 'viem'
import { useChainId, useChains, useReadContract } from 'wagmi'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'
import { JsonFragment } from '@ethersproject/abi'
import { buildExecTransactionCall } from '@mymultisig/protocol'
import { LegacyTransactionFailedEvent } from '../constants/abi/legacy'

import { MultiSigExecTransactionArgs, MultiSigTransactionRequest } from '../models/MultiSigs'
import { useNotification, useNotificationWarning } from './notifications'
import useFinalizeTransaction from './useFinalizeTransaction'
import useWalletType from './useWalletType'
import useMultiSigs from '../states/multiSigs'
import { patchMultiSigRequest } from '../utils'
import { applyAdminActionToMultiSig } from '../utils/adminActions'
import { isModernWallet } from '../utils/contractVersions'
import persistMultiSigWalletPatch from '../utils/persistWallet'

// Every outcome event any wallet generation can emit: the Extended ABI is a
// superset of the base one for 0.5.0, MyMultiSig carries the pre-0.5.0 shapes,
// and the legacy fragment covers the original TransactionFailed.
const outcomeEventsAbi = [
  ...(MyMultiSigExtended as Abi),
  ...(MyMultiSig as Abi),
  ...(LegacyTransactionFailedEvent as unknown as Abi)
].filter((item) => item.type === 'event')

const useExecTransaction = (
  args: MultiSigExecTransactionArgs,
  multiSigAddress: `0x${string}`,
  existingRequest: MultiSigTransactionRequest,
  existingRequestId: string
) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { notificationInfo, notificationError, notificationSuccess } = useNotification()
  const notificationEndOfLife = useNotificationWarning('Wallet approaching end of life')
  const { updateMultiSigTransactionRequest, updateMultiSig, multiSigs, multiSigTransactionRequests } = useMultiSigs()
  const { walletType, isFetched: walletTypeFetched } = useWalletType(multiSigAddress)
  const { data: versionData } = useReadContract({
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSig,
    functionName: 'version',
    query: { enabled: multiSigAddress !== '0x' }
  })
  const walletVersion = versionData != null ? String(versionData) : undefined
  const modern = isModernWallet(walletVersion)
  const isExtended = walletType === 'extended'
  // The overload per wallet generation lives in the shared protocol module so
  // agent tooling (SDK, MCP server, CLI) executes the exact same call.
  const execCall = buildExecTransactionCall({ args, walletVersion, isExtended })
  const config = {
    chainId: chain?.id,
    address: multiSigAddress,
    abi: execCall.abi as unknown as JsonFragment[],
    functionName: execCall.functionName,
    args: execCall.args
  }
  // The right overload is only known once the wallet's version and type have
  // been read; block execution until then rather than sending a call the
  // wallet would reject.
  const overloadReady = versionData != null && (!modern || walletTypeFetched)
  const preparationError = null
  const preparationIsError = false
  const {
    data,
    error,
    isError,
    isPending,
    isSuccess,
    writeContract,
    writeContractAsync,
    reset,
    status,
    dataFinal,
    isFinal
  } = useFinalizeTransaction(config, notificationInfo, notificationSuccess, notificationError)

  const markExecuted = (isSuccessful: boolean, requestPatch?: Partial<MultiSigExecTransactionArgs>) => {
    if (!chain || !existingRequestId) return
    // Always record the execution transaction hash so every viewer can open
    // it on the explorer and confirm what actually happened on-chain.
    const executionTxHash = dataFinal?.transactionHash
    const patch = {
      request: {
        ...existingRequest.request,
        ...requestPatch,
        ...(executionTxHash != null ? { executionTxHash } : {})
      },
      dateExecuted: new Date().toISOString(),
      isExecuted: true,
      isSuccessful
    }
    patchMultiSigRequest(existingRequestId, patch).then(() => {
      // The server now returns { content, cascade } — apply both so the
      // local Zustand mirrors what every other client will see on their
      // next refresh.
      updateMultiSigTransactionRequest(existingRequest.id, { ...existingRequest, ...patch })
    })
    // Owner/threshold operations are self-calls; once executed, mirror their
    // effect onto the locally stored wallet and into Neon (there is no
    // getOwners() to re-read; useAdminEventSync covers changes made by other
    // clients via the OwnerAdded/OwnerRemoved/ThresholdChanged events).
    //
    // Downstream-cascade invalidation moved server-side: PATCH now runs
    // cascadeInvalidate when isExecuted flips, so every client converges
    // on the next refresh. The previous client-side cancelStaleRequests
    // only saw the local Zustand store and missed requests opened in
    // other sessions.
    if (isSuccessful && args.to.toLowerCase() === multiSigAddress.toLowerCase()) {
      const stored = multiSigs.find((m) => m.address.toLowerCase() === multiSigAddress.toLowerCase())
      if (stored) {
        const walletPatch = applyAdminActionToMultiSig(args.data, stored)
        if (walletPatch) {
          updateMultiSig(multiSigAddress, walletPatch)
          persistMultiSigWalletPatch(chain.id, multiSigAddress, walletPatch)
        }
      }
    }
  }

  // Removed: cancelStaleRequests. The cascade helper now runs from the
  // PATCH handler when isExecuted flips, so this client-side filter is no
  // longer needed (and was incomplete — it only saw the local Zustand
  // store). Kept here as a no-op reference marker; see git history.

  // Shared success handler for TransactionExecuted / TransactionExecutedOp.
  // Best-effort batches also emit MultiRequestExecuted, whose handler owns the
  // status write (it carries the per-step results); writing here too could
  // race it and drop batchResults. Strict batches revert as a whole instead
  // of emitting MultiRequestExecuted, so reaching this event at all means
  // every step succeeded.
  const handleExecutedEvent = () => {
    const steps = existingRequest.request.batchSteps
    if (steps && steps.length > 0) {
      if (existingRequest.request.strictBatch)
        markExecuted(true, { batchResults: steps.map(() => ({ success: true, returnData: '0x' })) })
      return
    }
    markExecuted(true)
  }

  // Outcome events come from this transaction's own receipt. Polling seven
  // event watchers per mounted button hammered the RPC, and the watchers also
  // picked up events from other transactions on the same wallet.
  const processedReceipt = useRef<string | null>(null)
  useEffect(() => {
    if (!isFinal || dataFinal == null || processedReceipt.current === dataFinal.transactionHash) return
    processedReceipt.current = dataFinal.transactionHash
    const walletLogs = dataFinal.logs.filter((log) => log.address.toLowerCase() === multiSigAddress.toLowerCase())
    const events = parseEventLogs({ abi: outcomeEventsAbi, logs: walletLogs }) as unknown as {
      eventName: string
      args: Record<string, any>
    }[]
    events.forEach(({ eventName, args: eventArgs }) => {
      switch (eventName) {
        case 'TransactionExecuted':
        case 'TransactionExecutedOp':
          console.log(eventName, eventArgs.sender, eventArgs.to, eventArgs.value, eventArgs.txnNonce)
          handleExecutedEvent()
          break
        // MyMultiSig >= 0.1.x emits TxFailure (with the raw revert payload);
        // older deployments emit TransactionFailed.
        case 'TxFailure':
        case 'TxFailureOp':
        case 'TransactionFailed':
          console.log(eventName, eventArgs.sender, eventArgs.to, eventArgs.value, eventArgs.txnNonce, eventArgs.reason)
          markExecuted(false)
          break
        // Batch requests: capture the per-call outcome arrays so the request
        // detail view can show which legs failed.
        case 'MultiRequestExecuted': {
          if (!existingRequest.request.batchSteps) break
          const successes: boolean[] = eventArgs.successes ?? []
          const returnData: string[] = eventArgs.returnData ?? []
          console.log('MultiRequestExecuted', eventArgs.txNonce, successes)
          markExecuted(true, {
            batchResults: successes.map((success, i) => ({ success, returnData: returnData[i] ?? '0x' }))
          })
          break
        }
        case 'ContractEndOfLife':
          console.log('ContractEndOfLife', eventArgs.txNonceLefts)
          notificationEndOfLife(
            `Only ${String(eventArgs.txNonceLefts ?? 'a few')} transaction nonces remain on this wallet. Plan a migration to a new wallet.`
          )
          break
      }
    })
    // markExecuted/handleExecutedEvent are recreated per render; the receipt is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinal, dataFinal])
  return {
    data,
    preparationError,
    preparationIsError,
    error,
    isError,
    isPending,
    isSuccess,
    writeContract: () => {
      if (overloadReady) writeContract()
    },
    writeContractAsync,
    reset,
    status,
    dataFinal,
    isFinal
  }
}

export default useExecTransaction
