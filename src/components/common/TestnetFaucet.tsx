import React from 'react'
import { useSwitchChain } from 'wagmi'
import { ExternalLinkIcon, FlaskConicalIcon, TriangleAlertIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import networks, { DEFAULT_CHAIN } from '../../constants/networks'
import { faucetsFor } from '../../constants/faucets'

export interface TestnetFaucetProps {
  // The chain to explain. A testnet with a faucet shows the free test coin
  // links; a mainnet shows a "this is real money" note when suggestTestnet is
  // set; anything else renders nothing.
  chainId: number | undefined
  suggestTestnet?: boolean
  className?: string
}

// Explains what a testnet is and where to get free test coins, so a newcomer
// can practise the whole flow without spending real money.
const TestnetFaucet: React.FC<TestnetFaucetProps> = ({ chainId, suggestTestnet = false, className }) => {
  const { switchChain, isPending } = useSwitchChain()
  const chain = networks.find((c) => c.id === chainId)
  const faucets = faucetsFor(chainId)

  if (chain == null) return null

  if (faucets.length > 0) {
    const symbol = chain.nativeCurrency.symbol
    return (
      <div className={cn('flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3 text-xs', className)}>
        <FlaskConicalIcon className='mt-0.5 h-4 w-4 shrink-0 text-primary' aria-hidden />
        <div className='flex min-w-0 flex-col gap-1.5'>
          <p className='leading-relaxed text-muted-foreground'>
            <strong className='text-foreground'>{chain.name} is a testnet</strong>: a practice copy of the network
            where coins have no value. Everything works the same, and you can get free test {symbol} for gas from a
            faucet.
          </p>
          <ul className='flex flex-wrap gap-x-4 gap-y-1'>
            {faucets.map((faucet) => (
              <li key={faucet.url}>
                <a
                  href={faucet.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 font-medium text-primary hover:underline'
                >
                  {faucet.name}
                  <ExternalLinkIcon className='h-3 w-3' aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  if (suggestTestnet && !chain.testnet) {
    return (
      <div className={cn('flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/5 p-3 text-xs', className)}>
        <TriangleAlertIcon className='mt-0.5 h-4 w-4 shrink-0 text-primary' aria-hidden />
        <div className='flex min-w-0 flex-col items-start gap-2'>
          <p className='leading-relaxed text-muted-foreground'>
            <strong className='text-foreground'>{chain.name} uses real money.</strong> Deploying costs a real gas fee.
            To practise first for free, switch to {DEFAULT_CHAIN.name}, a testnet.
          </p>
          <Button
            size='sm'
            variant='outline'
            disabled={isPending}
            onClick={() => switchChain({ chainId: DEFAULT_CHAIN.id })}
          >
            Switch to {DEFAULT_CHAIN.name}
          </Button>
        </div>
      </div>
    )
  }

  return null
}

export default TestnetFaucet
