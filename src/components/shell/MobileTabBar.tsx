import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { BellIcon, HelpCircleIcon, HomeIcon, ListIcon, MenuIcon, PlusIcon, WalletIcon, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import useActiveWallet from '../../hooks/useActiveWallet'
import useHasMounted from '../../hooks/useHasMounted'
import useInbox from '../../hooks/useInbox'
import { walletHref } from './navigation'

interface Tab {
  href: string
  label: string
  icon: LucideIcon
  active: boolean
  count?: number
  primary?: boolean
}

const TabLink: React.FC<{ tab: Tab }> = ({ tab }) => (
  <Link
    href={tab.href}
    aria-current={tab.active ? 'page' : undefined}
    className={cn(
      'flex min-h-[54px] min-w-[60px] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-[11px] font-semibold',
      tab.active || tab.primary ? 'text-foreground' : 'text-muted-foreground'
    )}
  >
    <span
      className={cn(
        'relative grid h-7 w-10 place-items-center rounded-full',
        tab.primary && 'h-[34px] w-[46px] bg-primary text-primary-foreground',
        !tab.primary && tab.active && 'bg-primary/15 text-primary'
      )}
    >
      <tab.icon className='h-5 w-5' />
      {tab.count != null && tab.count > 0 && (
        <span className='absolute -right-1.5 -top-1.5 rounded-full bg-primary px-1.5 font-mono text-[10px] leading-[18px] text-primary-foreground'>
          {tab.count}
        </span>
      )}
    </span>
    {tab.label}
  </Link>
)

// Bottom navigation for screens without the sidebar: the four places a
// signer goes most, plus the full menu.
const MobileTabBar: React.FC<{ onOpenMenu: () => void }> = ({ onOpenMenu }) => {
  const router = useRouter()
  const hasMounted = useHasMounted()
  const { isConnected } = useAccount()
  const { wallet } = useActiveWallet()
  const { items, pendingByWallet } = useInbox()

  const connected = hasMounted && isConnected
  const path = router.pathname
  const onWalletPage = path.startsWith('/multisig/[multisigAddress]')
  const section = onWalletPage ? path.replace('/multisig/[multisigAddress]', '').replace('/', '') : null
  const onQueue = section === 'requests' || path.startsWith('/request/')

  const tabs: Tab[] =
    connected && wallet != null
      ? [
          {
            href: '/',
            label: 'Inbox',
            icon: BellIcon,
            active: path === '/',
            count: items.filter((i) => i.status !== 'waiting').length
          },
          {
            href: walletHref(wallet.address, 'requests'),
            label: 'Queue',
            icon: ListIcon,
            active: onQueue,
            count: pendingByWallet[wallet.address.toLowerCase()] ?? 0
          },
          {
            href: walletHref(wallet.address, 'buildRequest'),
            label: 'New',
            icon: PlusIcon,
            active: false,
            primary: true
          },
          {
            href: walletHref(wallet.address),
            label: 'Wallet',
            icon: WalletIcon,
            active: onWalletPage && !onQueue && section !== 'buildRequest'
          }
        ]
      : [
          { href: '/', label: connected ? 'Inbox' : 'Home', icon: connected ? BellIcon : HomeIcon, active: path === '/' },
          { href: '/open-multisig', label: 'Multisigs', icon: WalletIcon, active: path === '/open-multisig' },
          { href: '/create-multisig', label: 'Create', icon: PlusIcon, active: false, primary: true },
          { href: '/docs', label: 'Guides', icon: HelpCircleIcon, active: path.startsWith('/docs') }
        ]

  return (
    <nav
      aria-label='Main'
      className='fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-card/95 px-2 pb-[calc(6px+env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl lg:hidden'
    >
      {tabs.map((tab) => (
        <TabLink key={tab.label} tab={tab} />
      ))}
      <button
        type='button'
        onClick={onOpenMenu}
        aria-label='Open menu'
        className='flex min-h-[54px] min-w-[60px] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-[11px] font-semibold text-muted-foreground'
      >
        <span className='grid h-7 w-10 place-items-center'>
          <MenuIcon className='h-5 w-5' />
        </span>
        Menu
      </button>
    </nav>
  )
}

export default MobileTabBar
