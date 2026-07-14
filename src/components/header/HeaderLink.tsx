import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface HeaderLinkProps {
  name: string
  link: string
  imagePath?: string
  icon?: React.ReactElement
  isLogo?: boolean
}

const HeaderLink: React.FC<HeaderLinkProps> = ({ name, link, imagePath, icon, isLogo }) => {
  if (isLogo) {
    return (
      <Link key={`Link-${link}`} href={link}>
        <div className='flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-accent/50'>
          {imagePath ? (
            <Image src={imagePath} alt={name} width={28} height={28} className='h-7 w-7 rounded-md' />
          ) : (
            <span className='flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground'>
              {icon}
            </span>
          )}
          <span className='font-display text-lg font-bold tracking-tight text-foreground'>{name}</span>
        </div>
      </Link>
    )
  }

  return (
    <Link key={`Link-${link}`} href={link}>
      <div className={cn('flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-accent/50')}>
        {icon ? (
          <span className='text-muted-foreground'>{icon}</span>
        ) : imagePath ? (
          <Image src={imagePath} alt={name} width={16} height={16} className='h-4 w-4 rounded-sm' />
        ) : null}
        <span className='text-sm font-medium text-foreground'>{name}</span>
      </div>
    </Link>
  )
}

export default HeaderLink
