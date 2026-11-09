import React from 'react'
import { SiDiscord, SiTelegram } from 'react-icons/si'
import { MailIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export type Brand = 'slack' | 'discord' | 'telegram' | 'email'

export interface BrandIconProps {
  brand: Brand
  size?: number
  className?: string
}

// Slack's four-colour mark. react-icons no longer ships it, so the paths are
// inlined; each colour is one pair of lozenges.
const SlackMark: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg viewBox='0 0 24 24' width={size} height={size} className={className} aria-hidden>
    <path
      fill='#E01E5A'
      d='M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z'
    />
    <path
      fill='#36C5F0'
      d='M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z'
    />
    <path
      fill='#2EB67D'
      d='M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z'
    />
    <path
      fill='#ECB22E'
      d='M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z'
    />
  </svg>
)

// Third-party marks in their own colours, the same way wallet and network
// logos are shown. Email has no brand, so it uses the theme accent.
const BrandIcon: React.FC<BrandIconProps> = ({ brand, size = 18, className }) => {
  if (brand === 'slack') return <SlackMark size={size} className={cn('shrink-0', className)} />
  if (brand === 'discord')
    return <SiDiscord size={size} color='#5865F2' className={cn('shrink-0', className)} aria-hidden />
  if (brand === 'telegram')
    return <SiTelegram size={size} color='#26A5E4' className={cn('shrink-0', className)} aria-hidden />
  return <MailIcon width={size} height={size} className={cn('shrink-0 text-primary', className)} aria-hidden />
}

export default BrandIcon
