'use client'

import Link from 'next/link'
import React, { useState, useEffect, Fragment } from 'react'
import { useTheme } from 'next-themes'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  HamburgerIcon,
  MoonIcon,
  SunIcon,
  AddIcon,
  CheckCircleIcon,
  LinkIcon,
  LockIcon,
  InfoOutlineIcon
} from '../icons/ChakraIcons'
import { motion } from 'framer-motion'
import HeaderLink from './HeaderLink'
import HeaderNetworkSelector from './HeaderNetworkSelector'
import { HeaderWalletSelector } from './HeaderWalletSelector'

function useIsDesktop () {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const m = window.matchMedia('(min-width: 800px)')
    setIsDesktop(m.matches)
    const fn = () => setIsDesktop(m.matches)
    m.addEventListener('change', fn)
    return () => m.removeEventListener('change', fn)
  }, [])
  return isDesktop
}

const HeaderBox: React.FC = () => {
  const isDesktop = useIsDesktop()
  const { theme, setTheme } = useTheme()
  const [sheetOpen, setSheetOpen] = useState(false)

  const menu = [
    { name: 'Create a multisig', link: '/createMultiSig', icon: <AddIcon boxSize={16} className="shrink-0" /> },
    { name: 'Open existing multisig', link: '/useYourMultiSig', icon: <CheckCircleIcon boxSize={16} className="shrink-0" /> },
    { name: 'Integration', link: '/integration', icon: <LinkIcon boxSize={16} className="shrink-0" /> },
    { name: 'About', link: '/about', icon: <InfoOutlineIcon boxSize={16} className="shrink-0" /> }
  ]

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-20 w-full border-b border-border bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-4 md:gap-4 md:px-6">
        <div className="flex items-center gap-1 md:gap-2">
          {!isDesktop && (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu" className="text-foreground hover:bg-accent">
                  <HamburgerIcon boxSize={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="border-r border-border bg-background">
                <SheetHeader className="border-b border-border pb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <LockIcon className="h-4 w-4" />
                    </span>
                    <span className="font-display text-lg font-bold tracking-tight text-foreground">MyMultiSig</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-2">
                  {menu.map((item, index) => (
                    <motion.div
                      key={`MenuItem-${item.link}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link href={item.link} onClick={() => setSheetOpen(false)}>
                        <div className="flex items-center gap-3 rounded-lg p-3 hover:bg-accent/50">
                          {item.icon && <span className="text-primary">{item.icon}</span>}
                          <span className="text-sm font-medium text-foreground">{item.name}</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                  <div className="my-4 w-full border-t border-border" />
                  <div className="px-3">
                    <HeaderNetworkSelector />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}

          <HeaderLink name="MyMultiSig" link="/" icon={<LockIcon boxSize={16} className="shrink-0" />} isLogo />

          {isDesktop && (
            <Fragment>
              <div className="mx-2 h-5 w-px bg-border" />
              {menu.map((item, index) => (
                <motion.div
                  key={`Link-${item.name}`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                >
                  <HeaderLink name={item.name} link={item.link} icon={item.icon} />
                </motion.div>
              ))}
            </Fragment>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {isDesktop && (
            <>
              <HeaderNetworkSelector />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle theme"
                className="rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
              </Button>
            </>
          )}
          <HeaderWalletSelector />
        </div>
      </div>
    </motion.header>
  )
}

export default HeaderBox
