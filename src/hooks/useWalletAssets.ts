import { useCallback, useEffect, useState } from 'react'
import { useChainId, useChains } from 'wagmi'

import { WalletAssets } from '../models/Assets'
import { getAssets } from '../utils'

// Token and NFT holdings for any address on the current chain, via the
// server-side indexer proxy (/api/get-assets). Native balance stays a direct
// wagmi useBalance read in the consuming component.
const useWalletAssets = (address: `0x${string}`) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const [assets, setAssets] = useState<WalletAssets | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const fetchAssets = useCallback(async () => {
    if (!chain) return
    setIsLoading(true)
    setIsError(false)
    try {
      const data = await getAssets({ action: 'getWalletAssets', data: { address, chainId: chain.id } })
      if (data != null && data.content != null) {
        setAssets(data.content as WalletAssets)
      } else {
        setIsError(true)
      }
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [chain, address])

  useEffect(() => {
    setAssets(null)
    void fetchAssets()
  }, [fetchAssets])

  return { assets, isLoading, isError, refetch: fetchAssets }
}

export default useWalletAssets
