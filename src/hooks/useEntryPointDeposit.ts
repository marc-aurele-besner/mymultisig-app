import { useChainId, useChains, useReadContract, useWriteContract } from 'wagmi'

import { EntryPointAbi } from '../constants/abi/entryPoint'

// ERC-4337 gas deposit for a 0.5.0 Extended wallet: bundlers draw the fees of
// a UserOperation from the wallet's balance held inside the EntryPoint.
// Anyone can prefund it via the payable depositTo(wallet). The owner can
// withdraw the deposit back to themselves via `withdrawTo`.
const useEntryPointDeposit = (entryPoint: `0x${string}` | undefined, multiSigAddress: `0x${string}`) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { data: depositBalance, refetch } = useReadContract({
    chainId: chain?.id,
    address: entryPoint ?? '0x',
    abi: EntryPointAbi,
    functionName: 'balanceOf',
    args: [multiSigAddress],
    query: { enabled: entryPoint != null && multiSigAddress !== '0x', retry: false }
  })
  const { writeContractAsync, isPending } = useWriteContract()

  const deposit = async (amountWei: bigint) => {
    if (entryPoint == null) return
    await writeContractAsync({
      chainId: chain?.id,
      address: entryPoint,
      abi: EntryPointAbi,
      functionName: 'depositTo',
      args: [multiSigAddress],
      value: amountWei
    })
    refetch()
  }

  const withdraw = async (recipient: `0x${string}`, amountWei: bigint) => {
    if (entryPoint == null) return
    await writeContractAsync({
      chainId: chain?.id,
      address: entryPoint,
      abi: EntryPointAbi,
      functionName: 'withdrawTo',
      args: [recipient, amountWei]
    })
    refetch()
  }

  return {
    depositBalance: depositBalance != null ? BigInt(depositBalance) : undefined,
    deposit,
    withdraw,
    isPending,
    refetch
  }
}

export default useEntryPointDeposit
