import React from 'react'
import { useConnect } from 'wagmi'
import { motion } from 'framer-motion'
import { WalletCoinbase, WalletMetamask, WalletWalletConnect } from '@web3icons/react'
import { cn } from '@/lib/utils'
import ErrorCard from '../cards/ErrorCard'
import { WalletIcon } from '../icons/wallet'
import Disclaimer, { hasAcceptedDisclaimer } from '../modals/Disclaimer'

type WalletMark = React.FC<{ size: number }>

// Branded SVG marks from @web3icons/react (same source as NetworkIcon); the
// generic browser wallet uses the local stroke icon so it follows the theme.
const BrowserWalletMark: WalletMark = ({ size }) => (
  <WalletIcon width={size} height={size} className='text-foreground' />
)

const walletConfig: Record<string, { name: string; Mark: WalletMark; description: string }> = {
  metaMaskSDK: {
    name: 'MetaMask',
    Mark: ({ size }) => <WalletMetamask size={size} variant='branded' />,
    description: 'Connect using MetaMask'
  },
  coinbaseWalletSDK: {
    name: 'Coinbase',
    Mark: ({ size }) => <WalletCoinbase size={size} variant='branded' />,
    description: 'Connect using Coinbase Wallet'
  },
  walletConnect: {
    name: 'WalletConnect',
    Mark: ({ size }) => <WalletWalletConnect size={size} variant='branded' />,
    description: 'Scan with WalletConnect'
  },
  injected: {
    name: 'Browser Wallet',
    Mark: BrowserWalletMark,
    description: 'Use injected provider'
  }
}

// Connector ids vary across wagmi versions ('metaMask' vs 'metaMaskSDK'); fall
// back to a name match before giving up on a branded mark.
const configForConnector = (connector: { id: string; name: string }) =>
  walletConfig[connector.id] ??
  Object.values(walletConfig).find((c) => connector.name.toLowerCase().includes(c.name.toLowerCase())) ?? {
    name: connector.name,
    Mark: BrowserWalletMark,
    description: `Connect with ${connector.name}`
  }

export interface ConnectWalletProps {
  // Two columns and no heading, for narrow containers that bring their own
  // title (the connect modal, the home hero card).
  compact?: boolean
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ compact = false }) => {
  const { connect, connectors, error, isPending } = useConnect()
  const [connectingId, setConnectingId] = React.useState<string | null>(null)
  // Connector the user picked before accepting the disclaimer; connecting
  // resumes with it once they accept.
  const [awaitingDisclaimer, setAwaitingDisclaimer] = React.useState<(typeof connectors)[0] | null>(null)

  const startConnect = (connector: (typeof connectors)[0]) => {
    setConnectingId(connector.id)
    connect({ connector })
  }

  // The risk disclaimer is asked for here, the first time someone connects,
  // rather than on the first page view.
  const handleConnect = (connector: (typeof connectors)[0]) => {
    if (!hasAcceptedDisclaimer()) {
      setAwaitingDisclaimer(connector)
      return
    }
    startConnect(connector)
  }

  return (
    <>
      <div className={cn('flex w-full flex-col gap-4', !compact && 'items-center')}>
        {!compact && (
          <>
            <h2 className="text-center text-xl font-semibold text-foreground md:text-2xl">
              Connect your wallet
            </h2>
            <p className="max-w-[400px] text-center text-sm text-muted-foreground">
              Choose your preferred wallet to get started with MyMultiSig
            </p>
          </>
        )}

        <div
          className={cn(
            'grid w-full grid-cols-2 gap-3',
            compact ? '' : 'max-w-[700px] gap-4 pt-4 md:grid-cols-4'
          )}
        >
          {connectors.map((connector, index) => {
            const config = configForConnector(connector)
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
                className="relative w-full overflow-hidden rounded-xl border border-border bg-muted/50 p-4 opacity-100 transition-[transform,border-color] hover:border-primary/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
                  <div className="rounded-xl bg-muted p-3" aria-hidden>
                    <config.Mark size={compact ? 28 : 36} />
                  </div>
                  <span className="text-center text-sm font-semibold text-foreground">
                    {isConnecting ? 'Connecting…' : config.name}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {error != null && <ErrorCard>{error.message}</ErrorCard>}

      <Disclaimer
        open={awaitingDisclaimer != null}
        onOpenChange={(open) => {
          if (!open) setAwaitingDisclaimer(null)
        }}
        onAccept={() => {
          const connector = awaitingDisclaimer
          setAwaitingDisclaimer(null)
          if (connector != null) startConnect(connector)
        }}
      />
    </>
  )
}

export default ConnectWallet
