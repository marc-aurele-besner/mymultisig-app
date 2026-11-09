import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckIcon, ExternalLinkIcon } from '../icons/ChakraIcons'
import { cn } from '@/lib/utils'

export type IntegrationStatus = 'available' | 'in development' | 'alpha' | 'planned'

export interface IntegrationLink {
  label: string
  href: string
  // Opens in a new tab with an external-link icon (npm, GitHub, raw specs).
  external?: boolean
}

export interface IntegrationInfo {
  keyword: string
  title: string
  status: IntegrationStatus
  description: string
  features: string[]
  note?: string
  cta?: IntegrationLink
  secondaryCta?: IntegrationLink
}

const statusBadgeClassName: Record<IntegrationStatus, string> = {
  available: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  'in development': 'border-primary/40 bg-primary/15 text-primary',
  alpha: 'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300',
  planned: 'border-border bg-muted text-muted-foreground'
}

const CtaButton: React.FC<{ link: IntegrationLink; variant?: 'outline' | 'ghost' }> = ({
  link,
  variant = 'outline'
}) => (
  <Button asChild variant={variant} className='w-fit'>
    {link.external ? (
      <a href={link.href} target='_blank' rel='noopener noreferrer' className='gap-2'>
        {link.label}
        <ExternalLinkIcon className='h-3.5 w-3.5' />
      </a>
    ) : (
      <Link href={link.href} className='gap-2'>
        {link.label}
        <ExternalLinkIcon className='h-3.5 w-3.5' />
      </Link>
    )}
  </Button>
)

// One integration: keyword, status, what it does, and where to set it up.
// Used by the notifications page and the Agents & API page.
const IntegrationCard: React.FC<{ integration: IntegrationInfo }> = ({ integration }) => (
  <div className='flex flex-col gap-3 rounded-xl border border-border bg-card p-5'>
    <div className='flex items-center justify-between gap-2'>
      <span className='font-mono text-xs text-primary'>{integration.keyword}</span>
      <span
        className={cn(
          'rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider',
          statusBadgeClassName[integration.status]
        )}
      >
        {integration.status}
      </span>
    </div>
    <div>
      <h2 className='text-lg font-semibold text-foreground'>{integration.title}</h2>
      <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>{integration.description}</p>
    </div>
    <ul className='flex flex-col gap-1.5'>
      {integration.features.map((feature) => (
        <li key={feature} className='flex items-start gap-2 text-xs leading-relaxed text-muted-foreground'>
          <CheckIcon className='mt-0.5 h-3 w-3 shrink-0 text-primary/70' />
          {feature}
        </li>
      ))}
    </ul>
    {integration.note && (
      <p className='mt-auto border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground/80'>
        {integration.note}
      </p>
    )}
    {(integration.cta || integration.secondaryCta) && (
      <div className='mt-2 flex flex-wrap gap-2'>
        {integration.cta && <CtaButton link={integration.cta} />}
        {integration.secondaryCta && <CtaButton link={integration.secondaryCta} variant='ghost' />}
      </div>
    )}
  </div>
)

export default IntegrationCard
