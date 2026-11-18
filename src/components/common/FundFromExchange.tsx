import React from 'react'
import Link from 'next/link'
import type { Chain } from 'viem'

import { cn } from '@/lib/utils'
import { WarningIcon } from '../icons/ChakraIcons'
import AddressRow from './AddressRow'
import { exchangeFunding } from '../../utils/exchangeNetwork'

export interface FundFromExchangeProps {
  // The multisig to fund. Without it, the steps point to the wallet page.
  address?: string
  // The chain the multisig lives on. Without it, the copy stays generic.
  chain?: Chain | number
  className?: string
}

// How to fund a multisig with coins held on an exchange: which coin and
// network to pick when withdrawing, the risk of the wrong network, and a
// test amount first. Testnets get a faucet hint instead.
const FundFromExchange: React.FC<FundFromExchangeProps> = ({ address, chain, className }) => {
  const info = exchangeFunding(chain)

  if (info?.isTestnet === true)
    return (
      <div className={cn('flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-4', className)}>
        <h3 className='text-sm font-semibold text-foreground'>Funding a test wallet</h3>
        <p className='text-xs leading-relaxed text-muted-foreground'>
          This multisig is on {info.network}, a testnet. Test {info.symbol} is free from a faucet (search &ldquo;
          {info.network} faucet&rdquo;) and has no value. Exchanges do not support testnets: never send real coins here,
          they cannot be recovered.
        </p>
        {address != null && <AddressRow address={address} full />}
      </div>
    )

  const coin = info?.symbol ?? 'the network’s coin'
  return (
    <div className={cn('flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4', className)}>
      <h3 className='text-sm font-semibold text-foreground'>Coins on an exchange?</h3>
      <ol className='flex list-decimal flex-col gap-2 pl-5 text-xs leading-relaxed text-muted-foreground marker:font-mono marker:text-primary'>
        <li>
          On the exchange, open <strong className='text-foreground'>Withdraw</strong> (sometimes &ldquo;Send&rdquo;) and
          pick <strong className='text-foreground'>{coin}</strong>.
        </li>
        <li>
          For the network, choose{' '}
          {info != null ? (
            <>
              <strong className='text-foreground'>{info.network}</strong>
              {info.aka != null && <> (may be listed as {info.aka})</>}.
            </>
          ) : (
            <>the network your multisig lives on, shown on its page.</>
          )}
        </li>
        <li>
          {address != null ? (
            <>
              Paste this address as the destination:
              <AddressRow address={address} full className='mt-1.5' />
            </>
          ) : (
            <>
              Paste the multisig address as the destination (copy it from{' '}
              <Link href='/open-multisig' className='text-primary hover:underline'>
                your multisigs
              </Link>
              ).
            </>
          )}
        </li>
        <li>
          Send a <strong className='text-foreground'>small test amount</strong> first. Once it shows up in the
          wallet&rsquo;s balance, send the rest.
        </li>
      </ol>
      <p className='flex items-start gap-2 text-xs leading-relaxed text-foreground'>
        <WarningIcon className='mt-0.5 h-3.5 w-3.5 shrink-0 text-primary' />
        <span>
          Sending on another network
          {info != null ? <> than {info.network}</> : null} can lose the funds: the coins land at the same address on a
          chain where the multisig does not exist.
        </span>
      </p>
    </div>
  )
}

export default FundFromExchange
