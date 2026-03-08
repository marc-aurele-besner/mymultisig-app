import Link from 'next/link'
import React from 'react'
import { cn } from '@/lib/utils'

interface HeaderLinkProps {
  name: string
  link: string
  imagePath?: string
  icon?: React.ReactElement
  isLogo?: boolean
}

const HeaderLink: React.FC<HeaderLinkProps> = ({ name, link, icon, isLogo }) => {
  return (
    <Link key={`Link-${link}`} href={link}>
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-accent/50',
          isLogo && 'px-2'
        )}
      >
        {icon && (
          <span className={isLogo ? 'text-primary' : 'text-muted-foreground'}>
            {icon}
          </span>
        )}
        <span
          className={cn(
            'font-medium',
            isLogo
              ? 'text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'
              : 'text-sm text-foreground'
          )}
        >
          {name}
        </span>
      </div>
    </Link>
  )
}

export default HeaderLink
