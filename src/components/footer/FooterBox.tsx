import Link from 'next/link'
import React from 'react'
import { LockIcon, ExternalLinkIcon } from '../icons/ChakraIcons'

const footerLinks = [
  {
    name: 'Review contract code',
    href: 'https://github.com/marc-aurele-besner/mymultisig-contract'
  },
  {
    name: 'Review app code',
    href: 'https://github.com/marc-aurele-besner/mymultisig-app'
  }
]

const FooterBox: React.FC = () => {
  return (
    <footer className="relative z-[1] w-full border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 md:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary">
            <LockIcon className="h-3.5 w-3.5" />
          </span>
          <span className="font-display text-sm font-bold tracking-tight text-foreground">MyMultiSig.app</span>
          <span className="font-mono text-xs text-muted-foreground">© {new Date().getFullYear()}</span>
        </div>

        <div className="flex items-center gap-1">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.name}
              <ExternalLinkIcon boxSize={12} className="shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default FooterBox
