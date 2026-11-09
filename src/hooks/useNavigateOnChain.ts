import { useCallback } from 'react'
import { useRouter } from 'next/router'
import { useChainId, useSwitchChain } from 'wagmi'

// Wallet and request pages read the chain the app is currently on. Opening
// one that lives on another network therefore switches the app's network
// first, then navigates.
const useNavigateOnChain = () => {
  const router = useRouter()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  return useCallback(
    (href: string, targetChainId?: number) => {
      if (targetChainId != null && targetChainId !== chainId) switchChain({ chainId: targetChainId })
      void router.push(href)
    },
    [router, chainId, switchChain]
  )
}

export default useNavigateOnChain
