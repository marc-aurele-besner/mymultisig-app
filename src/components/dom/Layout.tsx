import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import FooterBox from '../footer/FooterBox'
import CommandPalette from '../shell/CommandPalette'
import MobileTabBar from '../shell/MobileTabBar'
import SidebarNav from '../shell/SidebarNav'
import TopBar from '../shell/TopBar'
import useAccountSync from '../../hooks/useAccountSync'
import { InboxProvider } from '../../hooks/useInbox'
import useOnboardingState from '../../states/onboarding'

interface LayoutProps {
  children: React.ReactNode
}

// Notification pages that count as "looked at notifications" for the
// getting-started checklist.
const NOTIFICATION_PATHS = ['/integration', '/settings/email', '/settings/slack', '/settings/discord', '/settings/telegram']

// App shell: a fixed sidebar (wallet switcher + navigation) beside a column
// with the top bar, the page and the footer. Below `lg` the sidebar moves
// into a sheet and a bottom tab bar takes over primary navigation.
const Layout: React.FC<LayoutProps> = ({ children }) => {
  useAccountSync()
  const router = useRouter()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { markNotificationsVisited } = useOnboardingState()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (NOTIFICATION_PATHS.includes(router.pathname)) markNotificationsVisited()
  }, [router.pathname, markNotificationsVisited])

  return (
    <InboxProvider>
      <div className='relative flex min-h-screen'>
        {/* Ambient background: a single ember glow anchored to the top, over a faint grid */}
        <div aria-hidden className='pointer-events-none fixed inset-0 z-0'>
          <div
            className='absolute inset-x-0 top-0 h-[60vh]'
            style={{
              background:
                'radial-gradient(ellipse 90% 90% at 50% -25%, color-mix(in oklab, var(--primary) 13%, transparent), transparent 70%)',
              animation: 'ember-breathe 7s ease-in-out infinite alternate',
              transformOrigin: 'top center'
            }}
          />
          <div
            className='absolute inset-0 opacity-[0.025]'
            style={{
              backgroundImage:
                'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              maskImage: 'linear-gradient(to bottom, black, transparent 80%)'
            }}
          />
        </div>

        <aside className='sticky top-0 z-10 hidden h-screen w-64 shrink-0 border-r border-border bg-card/60 p-3 backdrop-blur-xl lg:block'>
          <SidebarNav />
        </aside>

        <div className='relative z-[1] flex min-w-0 flex-1 flex-col'>
          <TopBar onOpenPalette={() => setPaletteOpen(true)} />
          <main className='mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6 md:py-10'>{children}</main>
          {/* Clear the fixed tab bar on small screens */}
          <div className='pb-20 lg:pb-0'>
            <FooterBox />
          </div>
        </div>

        <MobileTabBar onOpenMenu={() => setMenuOpen(true)} />

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent side='left' aria-describedby={undefined} className='w-[86%] max-w-xs border-r border-border bg-background p-3'>
            <SheetTitle className='sr-only'>Menu</SheetTitle>
            <SidebarNav onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      </div>
    </InboxProvider>
  )
}

export default Layout
