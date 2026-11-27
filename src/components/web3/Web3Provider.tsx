import React, { useMemo, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, type Transport } from 'wagmi'
import { coinbaseWallet, injected, metaMask, walletConnect } from 'wagmi/connectors'
import type { Chain } from 'viem/chains'
// import { ledger } from '@wagmi/connectors/ledger'
// import { safe } from '@wagmi/connectors/safe'

import networks, { DEFAULT_CHAIN } from '../../constants/networks'
import { pollingIntervalFor, transportFor } from '../../constants/rpcTransports'
import RpcContextSync from './RpcContextSync'

interface Web3ProviderProps {
  children: React.ReactNode
}

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? ''

// wagmi's walletConnect connector runs `setup()` as soon as the config is
// created, which initialises the WalletConnect provider and its modal and so
// calls api.web3modal.org for every visitor, before they have chosen a wallet
// or answered the consent banner. Dropping `setup` defers all of that to the
// first real use: the visitor clicking WalletConnect, or wagmi restoring a
// session the visitor already opened (reconnect resolves the provider itself).
const lazyWalletConnect = (parameters: Parameters<typeof walletConnect>[0]): ReturnType<typeof walletConnect> => {
  const create = walletConnect(parameters)
  return (config) => {
    const connector = create(config)
    return { ...connector, setup: undefined }
  }
}

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
            lazyWalletConnect({
              projectId,
              // The app renders no QR code of its own, so the provider's modal
              // (lazy-loaded on first use) is what shows the QR on desktop and
              // the wallet list on phones. Without it, connecting just spins.
              showQrModal: true
            })
          ]
        : []),
      injected({
        shimDisconnect: true
      })
    ]
    // wagmi starts on the first chain of the list until a chain is persisted
    // or a wallet connects, so DEFAULT_CHAIN goes first.
    const chains = [DEFAULT_CHAIN, ...networks.filter((chain) => chain.id !== DEFAULT_CHAIN.id)]
    return createConfig({
      chains: chains as [Chain, ...Chain[]],
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
      <QueryClientProvider client={queryClient}>
        <RpcContextSync />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default Web3Provider
