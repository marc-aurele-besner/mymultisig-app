import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowBackIcon, ArrowForwardIcon } from '../icons/ChakraIcons'

export interface RelatedGuide {
  title: string
  href: string
}

export interface GuideCta {
  // One line on what the reader can do now that they have read the guide.
  title: string
  text: string
  primary: { label: string; href: string }
  secondary?: { label: string; href: string }
}

// Used when a guide does not name its own next step.
const DEFAULT_CTA: GuideCta = {
  title: 'Ready to try it?',
  text: 'Create a multisig in one transaction, or follow the guided setup step by step.',
  primary: { label: 'Create a multisig', href: '/create-multisig' },
  secondary: { label: 'Follow the guided setup', href: '/get-started' }
}

interface GuideLayoutProps {
  kicker: string
  title: string
  lead: string
  /** Last content edit (YYYY-MM-DD), shown under the lead */
  updated?: string
  // Closing call to action: the thing the guide just explained how to do.
  cta?: GuideCta
  related?: RelatedGuide[]
  children: React.ReactNode
}

/** Section with an h2 heading; body copy goes in children (use GuideText / GuideList / GuideSteps). */
export const GuideSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="flex flex-col gap-3">
    <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">{title}</h2>
    {children}
  </section>
)

export const GuideText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_strong]:font-semibold [&_strong]:text-foreground">
    {children}
  </p>
)

export const GuideList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_strong]:font-semibold [&_strong]:text-foreground">
    {children}
  </ul>
)

/** Numbered steps — pairs with HowTo structured data on the page. */
export const GuideSteps: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ol className="flex list-decimal flex-col gap-3 pl-5 text-sm leading-relaxed text-muted-foreground marker:font-mono marker:text-primary [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_strong]:font-semibold [&_strong]:text-foreground">
    {children}
  </ol>
)

export const GuideNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground">
    {children}
  </div>
)

// Fixed locale and UTC so the server and the browser render the same string.
const formatDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

const GuideLayout: React.FC<GuideLayoutProps> = ({
  kicker,
  title,
  lead,
  updated,
  cta = DEFAULT_CTA,
  related,
  children
}) => {
  return (
    <div className="flex justify-center">
      <article className="flex w-full max-w-[760px] flex-col gap-8 py-4 md:py-8">
        <div>
          <Link
            href="/docs"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowBackIcon boxSize={14} className="shrink-0" />
            All guides
          </Link>
          <p className="mb-3 font-mono text-xs tracking-[0.2em] text-primary">{kicker}</p>
          <h1 className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
          <p className="text-lg font-medium leading-relaxed text-foreground">{lead}</p>
          {updated != null && (
            <p className="mt-4 font-mono text-xs text-muted-foreground">
              Last updated <time dateTime={updated}>{formatDate(updated)}</time>
            </p>
          )}
        </div>

        {children}

        <aside className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-primary/40 bg-primary/5 p-5 md:p-6">
          <div className="min-w-0 flex-1 basis-64">
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">{cta.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{cta.text}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="gap-2">
              <Link href={cta.primary.href}>
                {cta.primary.label}
                <ArrowForwardIcon className="h-4 w-4" />
              </Link>
            </Button>
            {cta.secondary != null && (
              <Button asChild variant="outline">
                <Link href={cta.secondary.href}>{cta.secondary.label}</Link>
              </Button>
            )}
          </div>
        </aside>

        {related && related.length > 0 && (
          <nav aria-label="Related guides" className="flex flex-col gap-3 border-t border-border pt-6">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground/70">Keep reading</h2>
            <ul className="flex flex-col gap-2">
              {related.map((guide) => (
                <li key={guide.href}>
                  <Link
                    href={guide.href}
                    className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    {guide.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </article>
    </div>
  )
}

export default GuideLayout
