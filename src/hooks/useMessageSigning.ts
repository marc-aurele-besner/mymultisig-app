import { useAccount, useChainId, useChains, useReadContract, useSignTypedData, useSwitchChain } from 'wagmi'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'
import { JsonFragment } from '@ethersproject/abi'

import { buildEip1271VoteTypedData, eip1271Message } from '../utils/eip1271'
import { hasWalletBoundEip1271 } from '../utils/contractVersions'

type WalletDomain = { name: string; version: string }

// EIP-1271 message signing (0.5.0+ wallets, base and Extended). A verifier
// calls isValidSignature(dataHash, signature); the wallet checks the
// wallet-bound hash getMessageHash(abi.encode(dataHash)) either way:
// - on-chain registry: isMessageSigned reports whether the owners registered
//   that hash via a signMessage(abi.encode(dataHash)) self-call;
// - off-chain votes (0.5.1+ only): each owner signs MyMultiSigMessage typed
//   data for abi.encode(dataHash) under the wallet's domain (signVote).
// Both reads revert on pre-0.5.0 wallets, in which case supportsMessageSigning
// stays false.
const useMessageSigning = (multiSigAddress: `0x${string}`, dataHash: `0x${string}` | null, wallet?: WalletDomain) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { chainId: walletChainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { signTypedDataAsync } = useSignTypedData()
  const base = {
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSig as JsonFragment[]
  }
  const message = dataHash != null ? eip1271Message(dataHash) : null

  const { data: messageHash, isError: hashUnsupported } = useReadContract({
    ...base,
    functionName: 'getMessageHash',
    args: [message ?? '0x'],
    query: { enabled: multiSigAddress !== '0x' && message != null, retry: false }
  })
  const { data: isSigned, refetch: refetchSigned } = useReadContract({
    ...base,
    functionName: 'isMessageSigned',
    args: [messageHash ?? '0x'],
    query: { enabled: messageHash != null, retry: false }
  })

  const supportsVotes = wallet != null && hasWalletBoundEip1271(wallet.version)

  // The connected owner's vote for dataHash. Only offered on 0.5.1+ wallets:
  // 0.5.0 wallets check votes against the raw hash, so a vote there would be
  // valid on every wallet with the same owners.
  const signVote = async (): Promise<`0x${string}` | null> => {
    if (!supportsVotes || wallet == null || dataHash == null || chain == null) return null
    // The typed-data domain names the app's chain; wallets refuse to sign
    // for another chain than the one they are on.
    if (walletChainId !== chain.id) await switchChainAsync({ chainId: chain.id })
    const typedData = buildEip1271VoteTypedData({
      domain: { name: wallet.name, version: wallet.version, chainId: chain.id, verifyingContract: multiSigAddress },
      dataHash
    })
    return signTypedDataAsync(typedData as never)
  }

  return {
    supportsMessageSigning: messageHash != null && !hashUnsupported,
    supportsVotes,
    message,
    messageHash: messageHash as `0x${string}` | undefined,
    isSigned: isSigned as boolean | undefined,
    refetchSigned,
    signVote
  }
}

export default useMessageSigning
