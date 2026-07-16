import { useChainId, useChains, useReadContracts } from 'wagmi'
import MyMultiSigFactory from 'mymultisig-contract/abi/MyMultiSigFactory.json'

// Per-type creation bookkeeping exposed by 0.5.0 factories. The typed counts
// revert on pre-0.5.0 factories (allowFailure keeps multiSigCount usable
// there), in which case supportsTypeCounts stays false.
const useFactoryStats = (factoryAddress: `0x${string}`) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const base = {
    chainId: chain?.id,
    address: factoryAddress,
    abi: MyMultiSigFactory
  } as const

  const { data } = useReadContracts({
    contracts: [
      { ...base, functionName: 'multiSigCount' },
      { ...base, functionName: 'simpleCount' },
      { ...base, functionName: 'extendedCount' },
      { ...base, functionName: 'advancedCount' }
    ],
    allowFailure: true,
    query: { enabled: factoryAddress !== '0x', retry: false }
  })

  const at = (index: number): number | undefined =>
    data?.[index]?.status === 'success' ? Number(data[index].result) : undefined

  return {
    totalCount: at(0),
    simpleCount: at(1),
    extendedCount: at(2),
    advancedCount: at(3),
    supportsTypeCounts: at(1) != null
  }
}

export default useFactoryStats
