import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { cn } from '@/lib/utils'

interface MultiSigNavProps {
  multiSigAddress: `0x${string}`
}

const TABS = [
  { slug: '', label: 'Overview' },
  { slug: 'buildRequest', label: 'Build a request' },
  { slug: 'requests', label: 'Requests' },
  { slug: 'activity', label: 'Activity' },
  { slug: 'addressBook', label: 'Address book' },
  { slug: 'settings', label: 'Owners & settings' }
] as const

// Shared navigation for every /multisig/[address] subpage so the same tabs
// appear everywhere, with the current page highlighted.
const MultiSigNav: React.FC<MultiSigNavProps> = ({ multiSigAddress }) => {
  const router = useRouter()
  const activeSlug = router.pathname.split('/multisig/[multisigAddress]')[1]?.replace('/', '') ?? ''

  return (
    <nav className='w-full overflow-x-auto pb-1'>
      <div className='flex w-max gap-1 rounded-lg border border-border bg-muted/30 p-1'>
        {TABS.map((tab) => {
          const isActive = activeSlug === tab.slug
          return (
            <Link
              key={tab.label}
              href={`/multisig/${multiSigAddress}${tab.slug === '' ? '' : `/${tab.slug}`}`}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MultiSigNav
