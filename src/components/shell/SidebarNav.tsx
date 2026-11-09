import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { BellIcon, HomeIcon, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import useActiveWallet from '../../hooks/useActiveWallet'
import useHasMounted from '../../hooks/useHasMounted'
import useInbox from '../../hooks/useInbox'
import GettingStartedChip from '../onboarding/GettingStartedChip'
import WalletSwitcher from './WalletSwitcher'
import { EXPLORE_NAV, WALLET_SECTIONS, WORKSPACE_NAV, isNavActive, walletHref } from './navigation'

const NavLink: React.FC<{
  href: string
  label: string
  icon: LucideIcon
  active: boolean
  count?: number
  onNavigate?: () => void
}> = ({ href, label, icon: Icon, active, count = 0, onNavigate }) => (
  <Link
    href={href}
    onClick={onNavigate}
    aria-current={active ? 'page' : undefined}
    className={cn(
      'flex min-h-9 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors',
      active
        ? 'bg-primary/15 font-semibold text-foreground'
        : 'font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground'
    )}
  >
    <Icon className={cn('h-4 w-4 shrink-0', active && 'text-primary')} />
    <span className='min-w-0 flex-1 truncate'>{label}</span>
    {count > 0 && (
      <span className='rounded-full bg-primary px-1.5 font-mono text-[10px] font-semibold leading-[18px] text-primary-foreground'>
        {count}
      </span>
    )}
  </Link>
)

const GroupLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className='truncate px-2.5 pb-1 pt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/80'>
    {children}
  </span>
)

// The sidebar's content. Rendered in the fixed desktop sidebar and inside
// the mobile menu sheet; `onNavigate` lets the sheet close itself.
const SidebarNav: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const router = useRouter()
  const hasMounted = useHasMounted()
  const { isConnected } = useAccount()
  const { wallet, wallets } = useActiveWallet()
  const { items, pendingByWallet } = useInbox()

  const connected = hasMounted && isConnected
  const needsYou = items.filter((i) => i.status !== 'waiting').length
  const path = router.asPath.split(/[?#]/)[0]
  const onRequestPage = router.pathname.startsWith('/request/')

  return (
    <div className='flex h-full min-h-0 flex-col gap-4'>
      <Link href='/' onClick={onNavigate} className='flex items-center gap-2.5 px-1.5 py-1'>
        <Image src='/favicon/favicon-96x96.png' alt='' width={28} height={28} className='h-7 w-7 rounded-md' />
        <span className='font-display text-lg font-bold tracking-tight text-foreground'>MyMultiSig</span>
      </Link>

      {connected && (
        <WalletSwitcher wallet={wallet} wallets={wallets} pendingByWallet={pendingByWallet} onNavigate={onNavigate} />
      )}

      <nav aria-label='Main' className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto'>
        <div className='flex flex-col gap-0.5'>
          <NavLink
            href='/'
            label={connected ? 'Inbox' : 'Home'}
            icon={connected ? BellIcon : HomeIcon}
            active={router.pathname === '/'}
            count={connected ? needsYou : 0}
            onNavigate={onNavigate}
          />
          {!connected &&
            WORKSPACE_NAV.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={isNavActive(router.pathname, item.href)}
                onNavigate={onNavigate}
              />
            ))}
        </div>

        {connected && wallet != null && (
          <div className='flex flex-col gap-0.5'>
            <GroupLabel>{wallet.name || 'Multisig'}</GroupLabel>
            {WALLET_SECTIONS.map((section) => {
              const href = walletHref(wallet.address, section.slug)
              const active =
                path.toLowerCase() === href.toLowerCase() || (section.slug === 'requests' && onRequestPage)
              return (
                <NavLink
                  key={section.slug}
                  href={href}
                  label={section.short}
                  icon={section.icon}
                  active={active}
                  count={section.slug === 'requests' ? (pendingByWallet[wallet.address.toLowerCase()] ?? 0) : 0}
                  onNavigate={onNavigate}
                />
              )
            })}
          </div>
        )}

        <div className='flex flex-col gap-0.5'>
          <GroupLabel>{connected ? 'Workspace' : 'Explore'}</GroupLabel>
          {connected &&
            WORKSPACE_NAV.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={isNavActive(router.pathname, item.href)}
                onNavigate={onNavigate}
              />
            ))}
          {EXPLORE_NAV.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={isNavActive(router.pathname, item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      {connected && <GettingStartedChip onNavigate={onNavigate} />}
    </div>
  )
}

export default SidebarNav
