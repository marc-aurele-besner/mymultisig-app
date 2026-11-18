import React from 'react'
import { useConnect } from 'wagmi'
import { motion } from 'framer-motion'
import {
  WalletCoinbase,
  WalletMetamask,
  WalletOkx,
  WalletPhantom,
  WalletRabby,
  WalletRainbow,
  WalletTrust,
  WalletWalletConnect,
  WalletZerion
} from '@web3icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ErrorCard from '../cards/ErrorCard'
import { WalletIcon } from '../icons/wallet'
import Disclaimer, { hasAcceptedDisclaimer } from '../modals/Disclaimer'
import useConnectModal from '../../states/connectModal'

// How long a connector may sit on "Connecting…" before we say so and offer a
// way out. Long enough for a wallet popup to open, short enough that a stuck
// connector never just spins.
export const CONNECT_STALL_MS = 15_000

type WalletMark = React.FC<{ size: number }>

// Branded SVG marks from @web3icons/react (same source as NetworkIcon); the
// generic browser wallet uses the local stroke icon so it follows the theme.
const BrowserWalletMark: WalletMark = ({ size }) => (
  <WalletIcon width={size} height={size} className='text-foreground' />
)

interface WalletBrand {
  name: string
  Mark: WalletMark
}

// Marks by connector id, for the connectors configured in Web3Provider.
const walletConfig: Record<string, WalletBrand> = {
  metaMaskSDK: { name: 'MetaMask', Mark: ({ size }) => <WalletMetamask size={size} variant='branded' /> },
  coinbaseWalletSDK: { name: 'Coinbase', Mark: ({ size }) => <WalletCoinbase size={size} variant='branded' /> },
  walletConnect: { name: 'WalletConnect', Mark: ({ size }) => <WalletWalletConnect size={size} variant='branded' /> },
  injected: { name: 'Browser Wallet', Mark: BrowserWalletMark }
}

// Marks by name, for wallets that announce themselves in the browser
// (EIP-6963): they arrive as extra connectors with ids we do not control.
const knownByName: { match: RegExp; Mark: WalletMark }[] = [
  { match: /metamask/i, Mark: ({ size }) => <WalletMetamask size={size} variant='branded' /> },
  { match: /coinbase/i, Mark: ({ size }) => <WalletCoinbase size={size} variant='branded' /> },
  { match: /walletconnect/i, Mark: ({ size }) => <WalletWalletConnect size={size} variant='branded' /> },
  { match: /phantom/i, Mark: ({ size }) => <WalletPhantom size={size} variant='branded' /> },
  { match: /rabby/i, Mark: ({ size }) => <WalletRabby size={size} variant='branded' /> },
  { match: /rainbow/i, Mark: ({ size }) => <WalletRainbow size={size} variant='branded' /> },
  { match: /okx/i, Mark: ({ size }) => <WalletOkx size={size} variant='branded' /> },
  { match: /trust/i, Mark: ({ size }) => <WalletTrust size={size} variant='branded' /> },
  { match: /zerion/i, Mark: ({ size }) => <WalletZerion size={size} variant='branded' /> }
]

// Resolution order: our configured connectors by id, then a known brand by
// name, then the icon the wallet announces about itself, then a generic mark.
// Wallets without a packaged mark (SubWallet, for one) get their own official
// icon this way, straight from the extension.
const configForConnector = (connector: { id: string; name: string; icon?: string }): WalletBrand => {
  const byId = walletConfig[connector.id]
  if (byId != null) return byId
  const known = knownByName.find((entry) => entry.match.test(connector.name) || entry.match.test(connector.id))
  if (known != null) return { name: connector.name, Mark: known.Mark }
  const announced = connector.icon
  if (announced != null && announced !== '')
    return {
      name: connector.name,
      // eslint-disable-next-line @next/next/no-img-element -- a data URI supplied by the wallet extension
      Mark: ({ size }) => <img src={announced} alt='' width={size} height={size} className='rounded-md' />
    }
  return { name: connector.name, Mark: BrowserWalletMark }
}

export interface ConnectWalletProps {
  // Two columns and no heading, for narrow containers that bring their own
  // title (the connect modal, the home hero card).
  compact?: boolean
  // One slim row per wallet instead of tiles, for tight spaces.
  list?: boolean
  // Show only the first N wallets. The caller offers the rest elsewhere
  // (see the "More wallets" button on the home hero).
  limit?: number
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ compact = false, list = false, limit }) => {
  const { connect, connectors: allConnectors, error, isPending, reset } = useConnect()
  const setConnectModalOpen = useConnectModal((state) => state.setOpen)
  const connectors = limit != null ? allConnectors.slice(0, limit) : allConnectors
  const [connectingId, setConnectingId] = React.useState<string | null>(null)
  // Connector the user picked before accepting the disclaimer; connecting
  // resumes with it once they accept.
  const [awaitingDisclaimer, setAwaitingDisclaimer] = React.useState<(typeof connectors)[0] | null>(null)

  // True once the current attempt has been pending for CONNECT_STALL_MS.
  const [stalled, setStalled] = React.useState(false)
  // Bumped on every attempt so "Try again" restarts the timer even when the
  // connector and pending state end up unchanged.
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    setStalled(false)
    if (!isPending || connectingId == null) return
    const timer = setTimeout(() => setStalled(true), CONNECT_STALL_MS)
    return () => clearTimeout(timer)
  }, [isPending, connectingId, attempt])

  const startConnect = (connector: (typeof connectors)[0]) => {
    setConnectingId(connector.id)
    setAttempt((count) => count + 1)
    // WalletConnect shows its own modal (QR code, or the wallet list on a
    // phone) once it has a pairing URI. Close the connect dialog then: its
    // focus trap and pointer lock would otherwise leave that modal unusable.
    if (connector.type === 'walletConnect') {
      // wagmi sends a "connecting" message first, so wait for the URI itself.
      const onMessage = ({ type }: { type: string }) => {
        if (type !== 'display_uri') return
        connector.emitter.off('message', onMessage)
        setConnectModalOpen(false)
      }
      connector.emitter.on('message', onMessage)
      connect({ connector }, { onSettled: () => connector.emitter.off('message', onMessage) })
      return
    }
    connect({ connector })
  }

  // Drop a stuck attempt so every wallet can be picked again. The wallet may
  // still answer later; that connects as usual.
  const cancelConnect = () => {
    reset()
    setConnectingId(null)
  }

  const stalledConnector = stalled ? allConnectors.find((connector) => connector.id === connectingId) : undefined

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
            'grid w-full gap-3',
            list ? 'grid-cols-1 gap-2' : 'grid-cols-2',
            !compact && !list && 'max-w-[700px] gap-4 pt-4 md:grid-cols-4'
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
                className={cn(
                  'relative w-full overflow-hidden rounded-xl border border-border bg-muted/50 opacity-100 transition-[transform,border-color] hover:border-primary/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
                  list ? 'px-3 py-2' : 'p-4'
                )}
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
                <div className={cn('flex items-center gap-3', !list && 'flex-col')}>
                  <div className={cn('bg-muted', list ? 'rounded-lg p-1.5' : 'rounded-xl p-3')} aria-hidden>
                    <config.Mark size={list ? 22 : compact ? 28 : 36} />
                  </div>
                  <span className={cn('text-sm font-semibold text-foreground', !list && 'text-center')}>
                    {isConnecting ? 'Connecting…' : config.name}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {stalledConnector != null && (
        <div role='status' className='flex flex-col gap-3 rounded-xl border border-border bg-muted/50 p-4 text-sm'>
          <p className='text-foreground'>
            {configForConnector(stalledConnector).name} has not opened yet. If no window, QR code or wallet app
            appeared, cancel and try again, or pick another wallet.
          </p>
          <div className='flex gap-2'>
            <Button
              size='sm'
              onClick={() => {
                cancelConnect()
                startConnect(stalledConnector)
              }}
            >
              Try again
            </Button>
            <Button size='sm' variant='outline' onClick={cancelConnect}>
              Cancel
            </Button>
          </div>
        </div>
      )}

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
