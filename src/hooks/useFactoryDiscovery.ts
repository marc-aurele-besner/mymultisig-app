import { useAccount, useChainId, useChains, useReadContract, useReadContracts } from 'wagmi'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'
import MyMultiSigFactory from 'mymultisig-contract/abi/MyMultiSigFactory.json'

import { WalletType } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'

export type DiscoveredMultiSig = {
  address: `0x${string}`
  name: string
  threshold: number
  ownerCount: number
  walletType: WalletType
  alreadyImported: boolean
}

// Enumerates the wallets the connected account created through the factory
// (multiSigCreatorCount / multiSigByCreator), so they can be re-imported on a
// fresh browser without knowing the addresses.
const useFactoryDiscovery = (factoryAddress: `0x${string}`) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { address: account } = useAccount()
  const { multiSigs } = useMultiSigs()

  const { data: count, isLoading: isCountLoading } = useReadContract({
    chainId: chain?.id,
    address: factoryAddress,
    abi: MyMultiSigFactory,
    functionName: 'multiSigCreatorCount',
    args: [account ?? '0x'],
    query: { enabled: account != null }
  })

  const total = count != null ? Number(count) : 0
  const indexes = Array.from({ length: total }, (_, i) => i)

  const { data: addresses } = useReadContracts({
    contracts: indexes.map((i) => ({
      chainId: chain?.id,
      address: factoryAddress,
      abi: MyMultiSigFactory as never,
      functionName: 'multiSigByCreator',
      args: [account ?? '0x', i]
    })),
    allowFailure: false,
    query: { enabled: account != null && total > 0 }
  })

  const walletAddresses = (addresses ?? []).map((a) => a as `0x${string}`)

  const { data: details } = useReadContracts({
    contracts: walletAddresses.flatMap((address) => [
      { chainId: chain?.id, address, abi: MyMultiSig as never, functionName: 'name' },
      { chainId: chain?.id, address, abi: MyMultiSig as never, functionName: 'threshold' },
      { chainId: chain?.id, address, abi: MyMultiSig as never, functionName: 'ownerCount' },
      // Extended-only probe: a revert identifies a simple wallet.
      { chainId: chain?.id, address, abi: MyMultiSigExtended as never, functionName: 'allowOnlyOwnerRequest' }
    ]),
    allowFailure: true,
    query: { enabled: walletAddresses.length > 0 }
  })

  const discovered: DiscoveredMultiSig[] =
    details != null
      ? walletAddresses.map((address, i) => {
          const base = i * 4
          return {
            address,
            name: String(details[base]?.result ?? ''),
            threshold: Number(details[base + 1]?.result ?? 0),
            ownerCount: Number(details[base + 2]?.result ?? 0),
            walletType: details[base + 3]?.status === 'success' ? ('extended' as const) : ('simple' as const),
            alreadyImported: multiSigs.some((m) => m.address.toLowerCase() === address.toLowerCase())
          }
        })
      : []

  return {
    discovered,
    total,
    isLoading: isCountLoading || (total > 0 && details == null)
  }
}

export default useFactoryDiscovery
