import Link from 'next/link'
import React from 'react'
import { LockIcon, ExternalLinkIcon } from '../icons/ChakraIcons'

interface FooterItem {
  name: string
  href: string
  external?: boolean
}

interface FooterColumn {
  title: string
  items: FooterItem[]
}

const footerColumns: FooterColumn[] = [
  {
    title: 'App',
    items: [
      { name: 'Create a multisig', href: '/createMultiSig' },
      { name: 'Import a multisig', href: '/importMultiSig' },
      { name: 'Open existing multisig', href: '/useYourMultiSig' },
      { name: 'Integration', href: '/integration' },
      { name: 'About', href: '/about' }
    ]
  },
  {
    title: 'Resources',
    items: [
      { name: 'App code', href: 'https://github.com/marc-aurele-besner/mymultisig-app', external: true },
      { name: 'Contract code', href: 'https://github.com/marc-aurele-besner/mymultisig-contract', external: true },
      { name: 'npm package', href: 'https://www.npmjs.com/package/mymultisig-contract', external: true },
      { name: 'Report an issue', href: 'https://github.com/marc-aurele-besner/mymultisig-app/issues', external: true }
    ]
  },
  {
    title: 'Legal & support',
    items: [
      { name: 'Terms & Conditions', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Contact', href: '/contact' }
    ]
  }
]

const FooterBox: React.FC = () => {
  return (
    <footer className="relative z-[1] w-full border-t border-border">
      <div className="pointer-events-none absolute left-[10%] right-[10%] top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-6">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1 md:pr-8">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary">
                <LockIcon className="h-3.5 w-3.5" />
              </span>
              <span className="font-display text-sm font-bold tracking-tight text-foreground">MyMultiSig.app</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Open-source, non-custodial multisig wallets on 15+ EVM chains. Your keys, your cosigners, your rules.
            </p>
          </div>

          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
              <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground/70">{column.title}</h3>
              <ul className="flex flex-col gap-2">
                {column.items.map((item) => (
                  <li key={item.href}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.name}
                        <ExternalLinkIcon boxSize={12} className="shrink-0" />
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <span className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} MyMultiSig.app
          </span>
          <span className="font-mono text-xs text-muted-foreground/70">
            Non-custodial — this app never holds your keys or funds.
          </span>
        </div>
      </div>
    </footer>
  )
}

export default FooterBox
