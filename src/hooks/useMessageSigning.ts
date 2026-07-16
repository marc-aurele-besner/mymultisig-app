import { useChainId, useChains, useReadContract } from 'wagmi'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'
import { JsonFragment } from '@ethersproject/abi'

// EIP-1271 message registry reads (0.5.0 wallets, base and Extended):
// getMessageHash wraps the raw message bytes in the wallet's EIP-712 domain,
// and isMessageSigned reports whether the owners registered that hash via a
// signMessage self-call. Both reads revert on pre-0.5.0 wallets, in which
// case supportsMessageSigning stays false.
const useMessageSigning = (multiSigAddress: `0x${string}`, messageBytes: `0x${string}` | null) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const base = {
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSig as JsonFragment[]
  }

  const { data: messageHash, isError: hashUnsupported } = useReadContract({
    ...base,
    functionName: 'getMessageHash',
    args: [messageBytes ?? '0x'],
    query: { enabled: multiSigAddress !== '0x' && messageBytes != null, retry: false }
  })
  const { data: isSigned, refetch: refetchSigned } = useReadContract({
    ...base,
    functionName: 'isMessageSigned',
    args: [messageHash ?? '0x'],
    query: { enabled: messageHash != null, retry: false }
  })

  return {
    supportsMessageSigning: messageHash != null && !hashUnsupported,
    messageHash: messageHash as `0x${string}` | undefined,
    isSigned: isSigned as boolean | undefined,
    refetchSigned
  }
}

export default useMessageSigning
