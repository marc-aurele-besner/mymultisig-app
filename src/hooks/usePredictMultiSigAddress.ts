import { useAccount, useChainId, useChains, useReadContract } from 'wagmi'
import MyMultiSigFactory from 'mymultisig-contract/abi/MyMultiSigFactory.json'
import contractConstants from 'mymultisig-contract/constants'

import { MultiSigConstructorArgs, isExtendedWallet } from '../models/MultiSigs'

// Preview of the CREATE2 wallet address a 0.5.0 factory would deploy for the
// connected creator + salt + constructor arguments (predict*Address mirrors
// what createDeterministic* will do). The read reverts on factories without
// the deterministic surface, in which case predictedAddress stays undefined.
const usePredictMultiSigAddress = (
  constructorArgs: MultiSigConstructorArgs,
  multiSigFactoryAddress: `0x${string}`,
  enabled: boolean
) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { address: account } = useAccount()
  const isExtended = isExtendedWallet(constructorArgs.walletType)

  const { data, isLoading } = useReadContract({
    chainId: chain?.id,
    address: multiSigFactoryAddress,
    abi: MyMultiSigFactory,
    functionName: isExtended
      ? constructorArgs.walletType === 'advanced'
        ? 'predictMyMultiSigAdvancedAddress'
        : 'predictMyMultiSigExtendedAddress'
      : 'predictMultiSigAddress',
    args: isExtended
      ? [
          account ?? '0x',
          constructorArgs.contractName,
          constructorArgs.owners,
          constructorArgs.threshold,
          constructorArgs.isOnlyOwnerRequest ?? false,
          contractConstants.ENTRY_POINT_V07_ADDRESS,
          constructorArgs.salt ?? '0x'
        ]
      : [
          account ?? '0x',
          constructorArgs.contractName,
          constructorArgs.owners,
          constructorArgs.threshold,
          constructorArgs.salt ?? '0x'
        ],
    query: {
      enabled: enabled && account != null && constructorArgs.salt != null && constructorArgs.owners.length > 0,
      retry: false
    }
  })

  return {
    predictedAddress: data != null ? (String(data) as `0x${string}`) : undefined,
    isLoading
  }
}

export default usePredictMultiSigAddress
