import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { GlobeIcon, KeyRoundIcon, MailIcon, MessageSquareIcon, PlugIcon, SendIcon, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

const SETTINGS_NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/settings/rpc', label: 'RPC endpoints', icon: GlobeIcon },
  { href: '/settings/email', label: 'Email', icon: MailIcon },
  { href: '/settings/slack', label: 'Slack', icon: MessageSquareIcon },
  { href: '/settings/discord', label: 'Discord', icon: MessageSquareIcon },
  { href: '/settings/telegram', label: 'Telegram', icon: SendIcon },
  { href: '/settings/agents', label: 'AI agents', icon: KeyRoundIcon }
]

// One hub for every account-level settings page. The pages used to be
// reachable only from the footer or the integration cards; this gives them a
// shared sub-navigation (a side list on wide screens, a scroll strip below).
const SettingsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter()
  return (
    <div className='grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8'>
      <nav
        aria-label='Settings'
        className='-mx-4 flex gap-1 overflow-x-auto px-4 lg:sticky lg:top-20 lg:mx-0 lg:flex-col lg:self-start lg:overflow-visible lg:px-0'
      >
        <span className='hidden px-2.5 pb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/80 lg:block'>
          Settings
        </span>
        {SETTINGS_NAV.map((item) => {
          const active = router.pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-9 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md px-2.5 text-sm transition-colors',
                active
                  ? 'bg-primary/15 font-semibold text-foreground'
                  : 'font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-4 w-4 shrink-0', active && 'text-primary')} />
              {item.label}
            </Link>
          )
        })}
        <span aria-hidden className='my-2 hidden h-px bg-border lg:block' />
        <Link
          href='/integration'
          className='flex min-h-9 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground'
        >
          <PlugIcon className='h-4 w-4 shrink-0' />
          All integrations
        </Link>
      </nav>
      <div className='min-w-0'>{children}</div>
    </div>
  )
}

export default SettingsLayout
