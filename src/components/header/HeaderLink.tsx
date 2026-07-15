import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HeaderLinkProps {
  name: string
  link: string
  imagePath?: string
  icon?: React.ReactElement
  isLogo?: boolean
  isActive?: boolean
}

const HeaderLink: React.FC<HeaderLinkProps> = ({ name, link, imagePath, icon, isLogo, isActive }) => {
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
    <Link key={`Link-${link}`} href={link} aria-current={isActive ? 'page' : undefined}>
      <div
        className={cn(
          'relative flex items-center gap-2 rounded-lg px-3 py-2 transition-colors',
          isActive ? 'text-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        )}
      >
        <span className='text-sm font-medium'>{name}</span>
        {isActive && (
          <motion.span
            layoutId='header-nav-underline'
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            className='absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-primary'
          />
        )}
      </div>
    </Link>
  )
}

export default HeaderLink
