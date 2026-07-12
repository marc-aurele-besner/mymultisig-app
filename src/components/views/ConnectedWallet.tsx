import React, { useEffect, useState } from 'react'
import {
  useAccount,
  useChainId,
  useChains,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
  useSwitchChain
} from 'wagmi'
import { CheckIcon, CopyIcon, ExternalLinkIcon } from '../icons/ChakraIcons'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import networks from '../../constants/networks'
import { cn } from '@/lib/utils'

const ConnectedWallet: React.FC = () => {
  const { address, connector, isConnected } = useAccount()
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { switchChain } = useSwitchChain()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName ?? undefined })
  const { disconnect } = useDisconnect()
  const [hasCopied, setHasCopied] = useState(false)

  const onCopy = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setHasCopied(true)
      setTimeout(() => setHasCopied(false), 2000)
    }
  }

  useEffect(() => {
    if (chain && switchChain && !networks.find((n) => n.id === chain.id)) {
      switchChain({ chainId: networks[0].id })
    }
  }, [chain, switchChain])

  if (!isConnected || !address) {
    return null
  }

  const truncateAddress = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-6)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto w-full max-w-[500px]"
    >
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-6">
        <div className="flex w-full items-center gap-4">
          {ensAvatar != null ? (
            <img
              src={ensAvatar}
              alt={ensName ?? address}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-500 text-lg font-bold text-white">
              {(ensName ?? address).slice(2, 4).toUpperCase()}
            </div>
          )}
          <div className="flex flex-1 flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-xs font-medium uppercase tracking-wider text-green-600 dark:text-green-400">
                Connected
              </span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {ensName ?? truncateAddress(address)}
            </p>
            {ensName != null && (
              <p className="text-xs text-muted-foreground">{truncateAddress(address)}</p>
            )}
          </div>
        </div>

        <div className="flex w-full items-center justify-between border-t border-border pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">via</span>
            <span className="text-sm font-medium text-primary">{connector?.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={onCopy}
              title={hasCopied ? 'Copied!' : 'Copy address'}
            >
              {hasCopied ? (
                <CheckIcon className="h-4 w-4 text-green-500" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </Button>
            {chain?.blockExplorers?.default != null && (
              <a
                href={`${chain.blockExplorers.default.url}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                title="View on explorer"
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>

        <Button
          className={cn(
            'w-full border border-destructive/50 bg-destructive/15 text-destructive hover:bg-destructive/25 hover:text-destructive'
          )}
          size="default"
          onClick={() => disconnect()}
        >
          Disconnect Wallet
        </Button>
      </div>
    </motion.div>
  )
}

export default ConnectedWallet
