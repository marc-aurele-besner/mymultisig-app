import React, { useEffect } from 'react'
import { useAccount } from 'wagmi'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import ConnectWallet from '../views/ConnectWallet'
import useConnectModal from '../../states/connectModal'

const STEPS = ['Connect', 'Sign in (free)', 'Create or import']

// The wallet picker as a dialog, opened by every "Connect" button. It shows
// the wallet options and where connecting sits in the first-run path, then
// closes itself once a wallet is connected.
const ConnectModal: React.FC = () => {
  const { open, setOpen } = useConnectModal()
  const { isConnected } = useAccount()

  useEffect(() => {
    if (isConnected && open) setOpen(false)
  }, [isConnected, open, setOpen])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='max-w-[520px] gap-5 border-border bg-card'>
        <DialogHeader>
          <DialogTitle className='font-display text-xl font-bold tracking-tight text-foreground'>
            Connect your wallet
          </DialogTitle>
          <DialogDescription>Choose your preferred wallet to get started with MyMultiSig.</DialogDescription>
        </DialogHeader>

        <ConnectWallet compact />

        <ol className='flex gap-3'>
          {STEPS.map((step, index) => (
            <li key={step} className='flex flex-1 flex-col gap-1.5'>
              <span aria-hidden className={cn('h-[3px] rounded-full', index === 0 ? 'bg-primary' : 'bg-muted')} />
              <span className={cn('text-xs', index === 0 ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                <span className='font-mono text-primary'>0{index + 1}</span> {step}
              </span>
            </li>
          ))}
        </ol>
        <p className='text-xs leading-relaxed text-muted-foreground'>
          Connecting creates nothing and costs nothing. After it, one free signature proves you own the wallet and
          syncs your multisigs across devices.
        </p>
      </DialogContent>
    </Dialog>
  )
}

export default ConnectModal
