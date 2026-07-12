import { useChainId, useChains, useReadContracts } from 'wagmi'
import MyMultiSigExtended from '../constants/abi/MyMultiSigExtended.json'

export type OwnerSettings = {
  lastAction: bigint
  transferInactiveOwnershipAfter: bigint
  delegate: `0x${string}`
}

// Extended-only reads: request policy, inactivity minimum, and per-owner
// delegation settings for the given owner list.
const useExtendedDetails = (multiSigAddress: `0x${string}`, owners: string[]) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const base = {
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSigExtended as never
  }
  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { ...base, functionName: 'allowOnlyOwnerRequest' },
      { ...base, functionName: 'minimumTransferInactiveOwnershipAfter' },
      ...owners.map((owner) => ({ ...base, functionName: 'ownerSettings', args: [owner] }))
    ],
    allowFailure: false,
    query: { enabled: multiSigAddress !== '0x' }
  })

  const ownerSettings: Record<string, OwnerSettings> = {}
  if (data != null) {
    owners.forEach((owner, i) => {
      const settings = data[2 + i] as {
        lastAction: bigint
        transferInactiveOwnershipAfter: bigint
        delegate: `0x${string}`
      }
      if (settings != null) ownerSettings[owner.toLowerCase()] = settings
    })
  }

  return {
    allowOnlyOwnerRequest: data != null ? Boolean(data[0]) : undefined,
    minimumTransferInactiveOwnershipAfter: data != null ? BigInt(data[1] as bigint) : undefined,
    ownerSettings,
    isLoading,
    refetch
  }
}

export default useExtendedDetails
