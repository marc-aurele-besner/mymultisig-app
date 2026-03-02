import React from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { coinbaseWallet, injected, metaMask, walletConnect } from 'wagmi/connectors'
import type { Chain } from 'viem/chains'
// import { ledger } from '@wagmi/connectors/ledger'
// import { safe } from '@wagmi/connectors/safe'

import networks from '../../constants/networks'

interface Web3ProviderProps {
  children: React.ReactNode
}

const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  // Set up config
  const config = createConfig({
    chains: networks as [Chain, ...Chain[]],
    connectors: [
      metaMask(),
      coinbaseWallet({
        appName: 'wagmi'
      }),
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? '',
        showQrModal: true
      }),
      injected({
        shimDisconnect: true
      })
      // ledger() // TODO: Add ledger connector from @wagmi/connectors/ledger
      // safe({
      //   allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
      //   debug: false
      // })
    ],
    transports: networks.reduce((acc, chain) => {
      acc[chain.id] = http()
      return acc
    }, {} as Record<number, ReturnType<typeof http>>)
  })

  return <WagmiProvider config={config}>{children}</WagmiProvider>
}

export default Web3Provider
