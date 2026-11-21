import React from 'react'
import { motion } from 'framer-motion'
import { WalletCoinbase, WalletMetamask } from '@web3icons/react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ExternalLinkIcon } from '../icons/ChakraIcons'

export const METAMASK_DOWNLOAD_URL = 'https://metamask.io/download/'

// Opens the current page inside the MetaMask mobile app's browser, where the
// wallet is injected. Without the app installed, the link lands on the store.
export const metaMaskDeepLink = (href: string): string => {
  try {
    const url = new URL(href)
    return `https://metamask.app.link/dapp/${url.host}${url.pathname}${url.search}`
  } catch {
    return 'https://metamask.app.link/dapp/mymultisig.app/'
  }
}

export interface NoWalletPanelProps {
  // Why the panel opened: shown as the first line so the user knows the
  // picked wallet did not respond rather than reading an error code.
  reason?: string
  // Phone or tablet: offer the MetaMask app instead of the extension.
  mobile?: boolean
  // Starts the Coinbase connector, which offers a Smart Wallet sign-up with
  // a passkey (nothing to install).
  onCreateSmartWallet?: () => void
  creatingSmartWallet?: boolean
  // Page to reopen inside MetaMask mobile; defaults to the current location.
  pageUrl?: string
  className?: string
}

// The "no wallet yet" path of the connect dialog: what a wallet is, one
// recommended pick that needs no install, and how to get MetaMask.
const NoWalletPanel: React.FC<NoWalletPanelProps> = ({
  reason,
  mobile = false,
  onCreateSmartWallet,
  creatingSmartWallet = false,
  pageUrl,
  className
}) => {
  // The panel only opens after a click, so it never renders on the server.
  const href = pageUrl ?? (typeof window !== 'undefined' ? window.location.href : '')

  return (
    <motion.section
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      aria-labelledby='no-wallet-title'
      className={cn('flex w-full flex-col gap-4 rounded-xl border border-border bg-muted/40 p-4', className)}
    >
      <div className='flex flex-col gap-1'>
        {reason != null && <p className='text-xs font-medium text-muted-foreground'>{reason}</p>}
        <h3 id='no-wallet-title' className='font-display text-base font-bold tracking-tight text-foreground'>
          No wallet yet?
        </h3>
        <p className='text-sm leading-relaxed text-muted-foreground'>
          A wallet is an app that holds your keys and approves what you sign. MyMultiSig never sees your keys.
        </p>
      </div>

      <div className='flex flex-col gap-3 rounded-lg border border-primary/40 bg-background/60 p-3'>
        <div className='flex items-start gap-3'>
          <div className='rounded-lg bg-muted p-1.5' aria-hidden>
            <WalletCoinbase size={24} variant='branded' />
          </div>
          <div className='flex flex-col gap-0.5'>
            <p className='text-sm font-semibold text-foreground'>
              Coinbase Smart Wallet <span className='ml-1 font-mono text-[11px] text-primary'>Recommended</span>
            </p>
            <p className='text-xs leading-relaxed text-muted-foreground'>
              Sign up in under a minute with a passkey (Face ID, Touch ID or your phone). Nothing to install, no
              seed phrase to write down.
            </p>
          </div>
        </div>
        <Button
          type='button'
          className='w-full'
          onClick={onCreateSmartWallet}
          disabled={onCreateSmartWallet == null || creatingSmartWallet}
        >
          {creatingSmartWallet ? 'Opening Coinbase…' : 'Create one with a passkey'}
        </Button>
      </div>

      <div className='flex items-start gap-3'>
        <div className='rounded-lg bg-muted p-1.5' aria-hidden>
          <WalletMetamask size={24} variant='branded' />
        </div>
        <div className='flex min-w-0 flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-0.5'>
            <p className='text-sm font-semibold text-foreground'>Prefer MetaMask?</p>
            <p className='text-xs leading-relaxed text-muted-foreground'>
              {mobile
                ? 'Install the MetaMask app, then open this page from its built-in browser.'
                : 'Install the MetaMask browser extension, then reload this page.'}
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            {mobile && (
              <Button asChild size='sm' variant='outline'>
                <a href={metaMaskDeepLink(href)} rel='noopener noreferrer'>
                  Open in MetaMask app
                </a>
              </Button>
            )}
            <Button asChild size='sm' variant={mobile ? 'ghost' : 'outline'}>
              <a href={METAMASK_DOWNLOAD_URL} target='_blank' rel='noopener noreferrer'>
                Get MetaMask <ExternalLinkIcon boxSize={12} className='ml-1' />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export default NoWalletPanel
