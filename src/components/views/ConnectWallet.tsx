import React from 'react'
import { useConnect } from 'wagmi'
import { motion } from 'framer-motion'
import Image from 'next/image'
import ErrorCard from '../cards/ErrorCard'

const walletConfig: Record<string, { name: string; icon: string; description: string }> = {
  metaMask: {
    name: 'MetaMask',
    icon: '/images/wallets/mm.png',
    description: 'Connect using MetaMask'
  },
  coinbaseWallet: {
    name: 'Coinbase',
    icon: '/images/wallets/cbw.png',
    description: 'Connect using Coinbase Wallet'
  },
  walletConnect: {
    name: 'WalletConnect',
    icon: '/images/wallets/wc.png',
    description: 'Scan with WalletConnect'
  },
  injected: {
    name: 'Browser Wallet',
    icon: '/images/wallets/injected.png',
    description: 'Use injected provider'
  }
}

const ConnectWallet: React.FC = () => {
  const { connect, connectors, error, isPending } = useConnect()
  const [connectingId, setConnectingId] = React.useState<string | null>(null)

  const handleConnect = (connector: (typeof connectors)[0]) => {
    setConnectingId(connector.id)
    connect({ connector })
  }

  return (
    <>
      <div className="flex w-full flex-col items-center gap-4">
        <h2 className="text-center text-xl font-semibold text-foreground md:text-2xl">
          Connect your wallet
        </h2>
        <p className="max-w-[400px] text-center text-sm text-muted-foreground">
          Choose your preferred wallet to get started with MyMultiSig
        </p>

        <div className="grid w-full max-w-[700px] grid-cols-2 gap-4 pt-4 md:grid-cols-4">
          {connectors.map((connector, index) => {
            const config =
              walletConfig[connector.id] ?? {
                name: connector.name,
                icon: '/images/wallets/injected.png',
                description: `Connect with ${connector.name}`
              }
            const isConnecting = isPending && connectingId === connector.id
            const isDisabled = isPending && connectingId !== connector.id

            return (
              <motion.button
                key={connector.id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleConnect(connector)}
                disabled={isDisabled}
                aria-disabled={isDisabled}
                className="relative w-full overflow-hidden rounded-xl border border-border bg-muted/50 p-4 opacity-100 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  borderColor: isConnecting ? 'var(--primary)' : undefined
                }}
              >
                {isConnecting && (
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                    style={{ animation: 'shimmer 1.5s infinite' }}
                  />
                )}
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-xl bg-muted p-3">
                    <Image
                      src={config.icon}
                      alt={config.name}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-center text-sm font-semibold text-foreground">
                    {config.name}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {error != null && <ErrorCard>{error.message}</ErrorCard>}
    </>
  )
}

export default ConnectWallet
