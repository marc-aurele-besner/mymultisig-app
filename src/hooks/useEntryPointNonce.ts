import { useChainId, useChains, useReadContract } from 'wagmi'

import { EntryPointAbi } from '../constants/abi/entryPoint'

// ERC-4337 v0.7 2D nonce for a wallet. The contract reads it via
// `EntryPoint.getNonce(sender, 192)` (192 = the 0.7 default key, same on
// every chain). The wallet's own `txnNonce` is unrelated — it tracks the
// multisig transaction path, not the UserOp path.
const useEntryPointNonce = (entryPoint: `0x${string}` | undefined, wallet: `0x${string}`) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { data, refetch, isLoading, isError } = useReadContract({
    chainId: chain?.id,
    address: entryPoint ?? '0x',
    abi: EntryPointAbi,
    functionName: 'getNonce',
    args: [wallet, 192n],
    query: { enabled: entryPoint != null && wallet !== '0x', retry: false }
  })
  return {
    nonce: data != null ? BigInt(data as bigint) : undefined,
    refetch,
    isLoading,
    isError
  }
}

export default useEntryPointNonce
