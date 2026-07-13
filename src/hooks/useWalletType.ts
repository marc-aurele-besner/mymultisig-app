import { useChainId, useChains, useReadContract } from 'wagmi'
import MyMultiSigExtended from '../constants/abi/MyMultiSigExtended.json'

import { WalletType } from '../models/MultiSigs'

// Detects whether a deployed wallet is a MyMultiSig or MyMultiSigExtended by
// probing allowOnlyOwnerRequest(), which only exists on the Extended variant.
// A revert means the wallet is a simple MyMultiSig.
const useWalletType = (multiSigAddress: `0x${string}`) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { data, isError, isFetched } = useReadContract({
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSigExtended,
    functionName: 'allowOnlyOwnerRequest',
    query: {
      enabled: multiSigAddress !== '0x',
      retry: false
    }
  })

  const walletType: WalletType | undefined = isFetched ? (isError ? 'simple' : 'extended') : undefined

  return {
    walletType,
    allowOnlyOwnerRequest: walletType === 'extended' ? Boolean(data) : false,
    isFetched
  }
}

export default useWalletType
