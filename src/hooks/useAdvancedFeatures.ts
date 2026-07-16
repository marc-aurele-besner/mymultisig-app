import { useChainId, useChains, useReadContracts } from 'wagmi'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'

// advancedFeaturesEnabled() bitmask bits (0.5.0 Extended wallets).
export const FEATURE_TIMELOCK = 1
export const FEATURE_GUARD = 2
export const FEATURE_ALLOWLIST = 4
export const FEATURE_ALLOWANCE = 8
export const FEATURE_MODULE = 16

// Read-side of the 0.5.0 Extended advanced surface. Every call reverts on
// pre-0.5.0 / simple wallets (allowFailure keeps the batch alive), in which
// case supportsAdvanced stays false and consumers hide their UI.
const useAdvancedFeatures = (multiSigAddress: `0x${string}`) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const base = {
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSigExtended
  } as const

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { ...base, functionName: 'advancedFeaturesEnabled' },
      { ...base, functionName: 'timelockDelay' },
      { ...base, functionName: 'guard' },
      { ...base, functionName: 'allowedTargetsEnabled' },
      { ...base, functionName: 'sensitiveValueThreshold' },
      { ...base, functionName: 'getModules' },
      { ...base, functionName: 'ENTRY_POINT' }
    ],
    allowFailure: true,
    query: { enabled: multiSigAddress !== '0x', retry: false }
  })

  const at = <T,>(index: number): T | undefined =>
    data?.[index]?.status === 'success' ? (data[index].result as T) : undefined

  const featuresBitmask = at<bigint>(0)
  return {
    supportsAdvanced: featuresBitmask != null,
    featuresBitmask: featuresBitmask != null ? Number(featuresBitmask) : 0,
    timelockDelay: at<bigint>(1),
    guard: at<`0x${string}`>(2),
    allowedTargetsEnabled: at<boolean>(3),
    sensitiveValueThreshold: at<bigint>(4),
    modules: (at<readonly `0x${string}`[]>(5) ?? []).map(String) as `0x${string}`[],
    entryPoint: at<`0x${string}`>(6),
    isLoading,
    refetch
  }
}

export default useAdvancedFeatures
