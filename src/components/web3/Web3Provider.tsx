import React, { useMemo, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { coinbaseWallet, injected, metaMask, walletConnect } from 'wagmi/connectors'
import type { Chain } from 'viem/chains'
// import { ledger } from '@wagmi/connectors/ledger'
// import { safe } from '@wagmi/connectors/safe'

import networks from '../../constants/networks'

interface Web3ProviderProps {
  children: React.ReactNode
}

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? ''

const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient())

  const config = useMemo(() => {
    const connectors = [
      metaMask(),
      coinbaseWallet({
        appName: 'wagmi'
      }),
      ...(projectId
        ? [
            walletConnect({
              projectId,
              showQrModal: false
            })
          ]
        : []),
      injected({
        shimDisconnect: true
      })
    ]
    return createConfig({
      chains: networks as [Chain, ...Chain[]],
      connectors,
      transports: networks.reduce((acc, chain) => {
        acc[chain.id] = http()
        return acc
      }, {} as Record<number, ReturnType<typeof http>>)
    })
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default Web3Provider
