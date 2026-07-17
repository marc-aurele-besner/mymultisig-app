import { useState } from 'react'
import { useAccount, useChainId, useChains, usePublicClient, useReadContract, useSignTypedData, useWriteContract } from 'wagmi'
import { toast } from 'sonner'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'
import { JsonFragment } from '@ethersproject/abi'

import useMultiSigDetails from './useMultiSigDetails'
import decodeContractError from '../utils/decodeContractError'
import { buildAllowanceTypedData } from '../utils/transactionTypedData'

// Per-owner daily allowance (0.5.0 Extended wallets): a single owner with a
// non-zero daily cap can move funds with just their own EIP-712 signature —
// no threshold, no other owners. The wallet enforces a rolling 24h window and
// only debits the cap when the inner call succeeds. The signature binds the
// dedicated AllowanceTransaction typehash to the wallet's allowanceNonce()
// (bumped on every use, so a signature is single-use and can never replay
// against execTransaction), and the transaction must be sent by the signing
// owner (the contract recovers the signer and requires it to be msg.sender).
const useSpendingAllowance = (multiSigAddress: `0x${string}`) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: details } = useMultiSigDetails(multiSigAddress, address ?? '0x')
  const { signTypedDataAsync } = useSignTypedData()
  const { writeContractAsync } = useWriteContract()
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const base = {
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSigExtended as JsonFragment[]
  }
  const enabled = multiSigAddress !== '0x' && address != null
  const { data: dailyLimit, refetch: refetchLimit } = useReadContract({
    ...base,
    functionName: 'dailySpendingLimit',
    args: [address ?? '0x'],
    query: { enabled, retry: false }
  })
  const { data: remaining, refetch: refetchRemaining } = useReadContract({
    ...base,
    functionName: 'spendingLimitRemaining',
    args: [address ?? '0x'],
    query: { enabled, retry: false }
  })
  const { data: allowanceNonce, refetch: refetchAllowanceNonce } = useReadContract({
    ...base,
    functionName: 'allowanceNonce',
    query: { enabled, retry: false }
  })

  const spend = async (to: `0x${string}`, valueWei: string, txnGas: string) => {
    if (!publicClient || details == null || chain == null || isPending) return
    if (allowanceNonce == null) {
      toast.error('The allowance nonce has not loaded yet — try again in a moment.')
      refetchAllowanceNonce()
      return
    }
    setIsPending(true)
    try {
      const typedData = buildAllowanceTypedData({
        domain: {
          name: String(details[0]),
          version: String(details[1]),
          chainId: chain.id,
          verifyingContract: multiSigAddress
        },
        to,
        value: BigInt(valueWei),
        data: '0x',
        gas: BigInt(txnGas),
        allowanceNonce: BigInt(String(allowanceNonce)),
        validUntil: 0n
      })
      const signature = await signTypedDataAsync(typedData as never)
      const hash = await writeContractAsync({
        ...base,
        abi: base.abi as never,
        functionName: 'execTransactionWithSpendingAllowance',
        args: [to, BigInt(valueWei), '0x', BigInt(txnGas), 0n, signature]
      })
      toast.info('Allowance transfer submitted...')
      await publicClient.waitForTransactionReceipt({ hash, confirmations: 1, timeout: 120_000 })
      toast.success('Allowance transfer confirmed')
      setIsSuccess(true)
      refetchRemaining()
      refetchAllowanceNonce()
    } catch (spendError) {
      console.error('Spending allowance error', spendError)
      const reason = decodeContractError(spendError)
      toast.error(reason ?? 'The allowance transfer failed.')
    } finally {
      setIsPending(false)
    }
  }

  return {
    // undefined on wallets without the allowance surface (reads revert).
    dailyLimit: dailyLimit != null ? BigInt(dailyLimit as bigint) : undefined,
    remaining: remaining != null ? BigInt(remaining as bigint) : undefined,
    spend,
    isPending,
    isSuccess,
    reset: () => setIsSuccess(false),
    refetch: () => {
      refetchLimit()
      refetchRemaining()
      refetchAllowanceNonce()
    }
  }
}

export default useSpendingAllowance
