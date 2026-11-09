import React, { useMemo, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, type Transport } from 'wagmi'
import { coinbaseWallet, injected, metaMask, walletConnect } from 'wagmi/connectors'
import type { Chain } from 'viem/chains'
// import { ledger } from '@wagmi/connectors/ledger'
// import { safe } from '@wagmi/connectors/safe'

import networks from '../../constants/networks'
import { pollingIntervalFor, transportFor } from '../../constants/rpcTransports'

interface Web3ProviderProps {
  children: React.ReactNode
}

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? ''

const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  // Contract reads (owners, threshold, nonce, version, ...) change rarely and
  // every mutation path refetches what it touched explicitly, so serve cached
  // reads for 30s instead of re-hitting the RPC on every mount and tab focus.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 2
          }
        }
      })
  )

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
      transports: Object.fromEntries(networks.map((chain) => [chain.id, transportFor(chain)])) as Record<
        number,
        Transport
      >,
      pollingInterval: Object.fromEntries(networks.map((chain) => [chain.id, pollingIntervalFor(chain)]))
    })
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default Web3Provider
