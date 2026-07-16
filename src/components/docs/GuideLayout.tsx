import React from 'react'
import Link from 'next/link'
import { ArrowBackIcon } from '../icons/ChakraIcons'

export interface RelatedGuide {
  title: string
  href: string
}

interface GuideLayoutProps {
  kicker: string
  title: string
  lead: string
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

const GuideLayout: React.FC<GuideLayoutProps> = ({ kicker, title, lead, related, children }) => {
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
        </div>

        {children}

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
