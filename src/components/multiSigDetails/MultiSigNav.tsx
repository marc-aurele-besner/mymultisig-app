import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { cn } from '@/lib/utils'

import useInbox from '../../hooks/useInbox'
import { WALLET_SECTIONS, walletHref } from '../shell/navigation'

interface MultiSigNavProps {
  multiSigAddress: `0x${string}`
}

// Wallet sections as a scrollable tab strip. On `lg` and up the same
// sections are in the app sidebar, so this strip is hidden there.
const MultiSigNav: React.FC<MultiSigNavProps> = ({ multiSigAddress }) => {
  const router = useRouter()
  const { pendingByWallet } = useInbox()
  const onRequestPage = router.pathname.startsWith('/request/')
  const activeSlug = onRequestPage
    ? 'requests'
    : (router.pathname.split('/multisig/[multisigAddress]')[1]?.replace('/', '') ?? '')
  const pending = pendingByWallet[multiSigAddress.toLowerCase()] ?? 0

  return (
    <nav aria-label='Wallet sections' className='-mx-4 overflow-x-auto border-b border-border px-4 lg:hidden'>
      <div className='flex w-max gap-1'>
        {WALLET_SECTIONS.map((section) => {
          const isActive = activeSlug === section.slug
          return (
            <Link
              key={section.slug}
              href={walletHref(multiSigAddress, section.slug)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                '-mb-px flex min-h-10 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 text-sm font-semibold transition-colors',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <section.icon className='h-4 w-4' />
              {section.label}
              {section.slug === 'requests' && pending > 0 && (
                <span className='rounded-full bg-primary px-1.5 font-mono text-[10px] leading-[18px] text-primary-foreground'>
                  {pending}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MultiSigNav
