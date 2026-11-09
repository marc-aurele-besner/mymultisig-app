import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { MoonIcon, SearchIcon, SunIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import HeaderNetworkSelector from '../header/HeaderNetworkSelector'
import { HeaderWalletSelector } from '../header/HeaderWalletSelector'
import useHasMounted from '../../hooks/useHasMounted'

// Slim bar above the page: search trigger, network, theme and wallet. On
// small screens it also carries the logo, since the sidebar is hidden there.
const TopBar: React.FC<{ onOpenPalette: () => void }> = ({ onOpenPalette }) => {
  const { resolvedTheme, setTheme } = useTheme()
  const hasMounted = useHasMounted()
  const isLight = hasMounted && resolvedTheme === 'light'

  return (
    <header className='sticky top-0 z-20 flex h-14 w-full items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6'>
      <Link href='/' aria-label='MyMultiSig home' className='mr-auto flex items-center lg:hidden'>
        <Image src='/favicon/favicon-96x96.png' alt='' width={28} height={28} className='h-7 w-7 rounded-md' />
      </Link>

      <button
        type='button'
        onClick={onOpenPalette}
        aria-label='Search and jump'
        className='order-last flex h-9 w-9 items-center justify-center gap-2 rounded-md border border-border text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:order-none lg:mr-auto lg:w-80 lg:justify-start lg:px-3'
      >
        <SearchIcon className='h-4 w-4 shrink-0' />
        <span className='hidden flex-1 text-left lg:inline'>Search or jump to…</span>
        <kbd className='hidden rounded border border-border bg-muted px-1.5 font-mono text-[11px] lg:inline'>⌘K</kbd>
      </button>

      <HeaderNetworkSelector />
      <Button
        variant='ghost'
        size='icon'
        aria-label='Toggle theme'
        className='rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground'
        onClick={() => setTheme(isLight ? 'dark' : 'light')}
      >
        {isLight ? <MoonIcon className='h-5 w-5' /> : <SunIcon className='h-5 w-5' />}
      </Button>
      <HeaderWalletSelector />
    </header>
  )
}

export default TopBar
