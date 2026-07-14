import React from 'react'
import { erc20Abi } from 'viem'
import { useChainId, useSendTransaction, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { toast } from 'sonner'

import decodeContractError from '../utils/decodeContractError'
import { useNotification } from './notifications'

// Direct deposit into the multisig from the connected wallet: a plain native
// transfer or an ERC-20 `transfer`. Receiving funds needs no signature flow,
// so this bypasses the request/approval machinery entirely.
const useFundMultiSig = (multiSigAddress: `0x${string}`) => {
  const chainId = useChainId()
  const { notificationInfo, notificationError, notificationSuccess } = useNotification()
  const native = useSendTransaction()
  const token = useWriteContract()

  const hash = native.data ?? token.data
  const error = native.error ?? token.error

  React.useEffect(() => {
    if (error) {
      console.error('Error', error)
      const reason = decodeContractError(error)
      if (reason) toast.error(reason)
      notificationError()
    }
  }, [error, notificationError])

  React.useEffect(() => {
    if (hash) {
      notificationInfo()
    }
  }, [hash, notificationInfo])

  const { data: receipt, isSuccess: isFinal } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
    timeout: 120_000,
    query: {
      enabled: !!hash
    }
  })

  React.useEffect(() => {
    if (isFinal && receipt) {
      notificationSuccess()
    }
  }, [isFinal, receipt, notificationSuccess])

  const fundNative = (amount: bigint) => native.sendTransaction({ chainId, to: multiSigAddress, value: amount })

  const fundToken = (tokenAddress: `0x${string}`, amount: bigint) =>
    token.writeContract({
      chainId,
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [multiSigAddress, amount]
    })

  const reset = () => {
    native.reset()
    token.reset()
  }

  return {
    fundNative,
    fundToken,
    hash,
    receipt,
    isFinal,
    isPending: native.isPending || token.isPending,
    error,
    reset
  }
}

export default useFundMultiSig
