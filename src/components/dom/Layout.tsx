import React from 'react'
import HeaderBox from '../header/HeaderBox'
import FooterBox from '../footer/FooterBox'
import useAddressBookSync from '../../hooks/useAddressBookSync'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  useAddressBookSync()
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Ambient background: a single ember glow anchored to the top, over a faint grid */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-x-0 top-0 h-[60vh]"
          style={{
            background:
              'radial-gradient(ellipse 90% 90% at 50% -25%, color-mix(in oklab, var(--primary) 13%, transparent), transparent 70%)'
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'linear-gradient(to bottom, black, transparent 80%)'
          }}
        />
      </div>

      <HeaderBox />
      <main className="relative z-[1] mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6 md:py-12">
        {children}
      </main>
      <FooterBox />
    </div>
  )
}

export default Layout
