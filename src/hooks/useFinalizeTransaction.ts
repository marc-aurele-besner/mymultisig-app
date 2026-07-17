import React from 'react'
import { useAccount, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { toast } from 'sonner'
import { JsonFragment } from '@ethersproject/abi'

import decodeContractError from '../utils/decodeContractError'

const useFinalizeTransaction = <TFunctionName extends string>(
  config: {
    chainId?: number
    address: `0x${string}`
    abi: JsonFragment[]
    functionName: TFunctionName
    args?: readonly unknown[]
  },
  notificationInfo: () => void,
  notificationSuccess: () => void,
  notificationError: () => void
) => {
  const { data, error, isPending, isSuccess, isError, writeContract: writeContractFn, writeContractAsync, reset, status } = useWriteContract()
  const { chainId: walletChainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()

  // The wallet can sit on a different chain than the app (the header selector
  // only moves the app state when the connector will not follow), and wagmi's
  // writeContract hard-errors on the mismatch instead of prompting. Ask the
  // wallet to switch to the target chain first, and only then submit.
  const ensureWalletChain = async (): Promise<boolean> => {
    if (config.chainId == null || walletChainId === config.chainId) return true
    try {
      await switchChainAsync({ chainId: config.chainId })
      return true
    } catch (switchError) {
      console.error('Chain switch rejected', switchError)
      toast.error('Switch your wallet to the selected network to continue.')
      notificationError()
      return false
    }
  }

  // Handle errors and success via useEffect or mutation callbacks
  React.useEffect(() => {
    if (error) {
      console.error('Error', error)
      // Surface the wallet's decoded custom error (NotOwner, NonceAlreadyUsed,
      // ...) next to the generic failure toast when one is available.
      const reason = decodeContractError(error)
      if (reason) toast.error(reason)
      notificationError()
    }
  }, [error, notificationError])
  
  React.useEffect(() => {
    if (data) {
      notificationInfo()
    }
  }, [data, notificationInfo])
  const { data: dataFinal, isSuccess: isFinal } = useWaitForTransactionReceipt({
    hash: data,
    confirmations: 1,
    timeout: 120_000,
    query: {
      enabled: !!data
    }
  })
  
  React.useEffect(() => {
    if (isFinal && dataFinal) {
      notificationSuccess()
    }
  }, [isFinal, dataFinal, notificationSuccess])
  
  React.useEffect(() => {
    if (dataFinal && 'error' in dataFinal) {
      console.error('Error', dataFinal.error)
      notificationError()
    }
  }, [dataFinal, notificationError])

  return {
    data,
    error,
    isError,
    isPending,
    isSuccess,
    writeContract: () => {
      ensureWalletChain().then((ok) => {
        if (ok) writeContractFn(config)
      })
    },
    writeContractAsync: async () => {
      if (!(await ensureWalletChain())) throw new Error('The wallet is not on the selected network.')
      return writeContractAsync(config)
    },
    reset,
    status,
    dataFinal,
    isFinal
  }
}

export default useFinalizeTransaction
