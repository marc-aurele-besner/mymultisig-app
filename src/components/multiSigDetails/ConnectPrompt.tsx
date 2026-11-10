import React from 'react'
import { useAccount } from 'wagmi'

import BigCard from '../cards/BigCard'
import ConnectWallet from '../views/ConnectWallet'
import useHasMounted from '../../hooks/useHasMounted'

export interface ConnectPromptProps {
  // What the visitor is trying to open, e.g. "this multisig".
  what?: string
}

// Shown on wallet and request pages when no wallet is connected, instead of
// a blank page. Stays empty while wagmi is still restoring a previous
// connection so returning users do not see the prompt flash on reload.
const ConnectPrompt: React.FC<ConnectPromptProps> = ({ what = 'this multisig' }) => {
  const hasMounted = useHasMounted()
  const { status } = useAccount()

  if (!hasMounted || status === 'reconnecting' || status === 'connecting') return null

  return (
    <div className='flex justify-center'>
      <BigCard className='max-w-[800px]'>
        <div className='flex w-full flex-col gap-6'>
          <div>
            <p className='mb-2 font-mono text-xs tracking-[0.2em] text-primary'>CONNECT TO CONTINUE</p>
            <h1 className='font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl'>
              Connect a wallet to open {what}
            </h1>
            <p className='mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground'>
              Reading is free. Only the owners of a multisig can sign or execute its requests.
            </p>
          </div>
          <ConnectWallet />
        </div>
      </BigCard>
    </div>
  )
}

export default ConnectPrompt
