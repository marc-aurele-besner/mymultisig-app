import type { Abi } from 'viem'
import MyMultiSigFactory from 'mymultisig-contract/abi/MyMultiSigFactory.json'

import { ENTRY_POINT_V07_ADDRESS, type CreateMultiSigInput } from './create'
import { isExtendedWallet } from './types'

export type PredictMultiSigAddressCall = {
  abi: Abi
  functionName: 'predictMultiSigAddress' | 'predictMyMultiSigExtendedAddress' | 'predictMyMultiSigAdvancedAddress'
  args: readonly unknown[]
}

// CREATE2 address a 0.5.0 factory will deploy to for `creator` + salt + the
// constructor arguments (mirrors usePredictMultiSigAddress in the app).
export const buildPredictMultiSigAddressCall = (
  creator: `0x${string}`,
  input: Omit<CreateMultiSigInput, 'factoryVersion'> & { salt: `0x${string}` }
): PredictMultiSigAddressCall => {
  const isExtended = isExtendedWallet(input.walletType)
  return {
    abi: MyMultiSigFactory as Abi,
    functionName: isExtended
      ? input.walletType === 'advanced'
        ? 'predictMyMultiSigAdvancedAddress'
        : 'predictMyMultiSigExtendedAddress'
      : 'predictMultiSigAddress',
    args: isExtended
      ? [
          creator,
          input.contractName,
          input.owners,
          input.threshold,
          input.isOnlyOwnerRequest ?? false,
          ENTRY_POINT_V07_ADDRESS,
          input.salt
        ]
      : [creator, input.contractName, input.owners, input.threshold, input.salt]
  }
}
