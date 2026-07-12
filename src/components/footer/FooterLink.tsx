import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface FooterLinkProps {
  name: string
  link: string
  imagePath?: string
  target?: string
  icon?: React.ReactElement
}

const FooterLink: React.FC<FooterLinkProps> = ({ name, link, imagePath, target, icon }) => {
  return (
    <Link
      key={`Link-${link}`}
      href={link}
      target={target}
      className="ml-4 rounded-lg border border-transparent p-1 transition-colors hover:border-border"
    >
      <div className="flex items-center gap-2">
        {icon ? (
          <span className="leading-none">{icon}</span>
        ) : imagePath ? (
          <Image src={imagePath} alt={name} width={32} height={32} className="h-8 w-auto" />
        ) : null}
        <span key={`LinkText-${link}`} className="text-base font-medium text-foreground hover:text-primary">
          {name}
        </span>
      </div>
    </Link>
  )
}

export default FooterLink
