import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import BigCard from '../cards/BigCard'
import { CheckIcon, ExternalLinkIcon } from '../icons/ChakraIcons'
import { cn } from '@/lib/utils'

type IntegrationStatus = 'in development' | 'planned'

interface NotificationIntegration {
  keyword: string
  title: string
  status: IntegrationStatus
  description: string
  features: string[]
  note?: string
}

const lifecycleEvents = ['request proposed', 'awaiting signatures', 'ready to execute']

const notificationIntegrations: NotificationIntegration[] = [
  {
    keyword: 'slack',
    title: 'Slack',
    status: 'in development',
    description: 'Bring requests to the channel where your team already talks.',
    features: [
      'Post each new request to a channel of your choice',
      '@mention the signers whose approval is missing',
      'One-click link to the request page to sign',
      'Slash commands: propose, sign, balance, address book'
    ],
    note: 'A first version of the bot lives in the app’s API and is being wired up.'
  },
  {
    keyword: 'discord',
    title: 'Discord',
    status: 'planned',
    description: 'The same flow for DAOs and communities that live on Discord.',
    features: [
      'Webhook posts each new request to a channel',
      'Ping the signer role when approvals are missing',
      'One-click link to the request page to sign'
    ]
  },
  {
    keyword: 'email',
    title: 'Email',
    status: 'planned',
    description: 'No bot to install — notifications straight to each signer’s inbox.',
    features: [
      '“Request needs your signature” when a request waits on you',
      '“Threshold reached, ready to execute” when quorum is met'
    ],
    note: 'Built on Resend, which already powers the contact form.'
  }
]

const buildYourOwn = [
  {
    keyword: 'contracts',
    title: 'ABIs on npm',
    description: 'Factory and wallet ABIs ship in the mymultisig-contract package.',
    href: 'https://www.npmjs.com/package/mymultisig-contract'
  },
  {
    keyword: 'onchain',
    title: 'Standard EVM calls',
    description: 'Every read and write is a plain contract call — wagmi, viem, ethers all work.',
    href: 'https://github.com/marc-aurele-besner/mymultisig-contract'
  },
  {
    keyword: 'app',
    title: 'Open API routes',
    description: 'The app’s request storage and signing routes are open source.',
    href: 'https://github.com/marc-aurele-besner/mymultisig-app/tree/main/src/pages/api'
  }
]

const requestIssueUrl =
  'https://github.com/marc-aurele-besner/mymultisig-app/issues/new' +
  `?title=${encodeURIComponent('Integration request: ')}` +
  `&body=${encodeURIComponent(
    'Which integration do you need (Slack / Discord / Email / other)?\n\nHow does your team use MyMultiSig?\n'
  )}`

const statusBadgeClassName: Record<IntegrationStatus, string> = {
  'in development': 'border-primary/40 bg-primary/15 text-primary',
  planned: 'border-border bg-muted text-muted-foreground'
}

const Integration: React.FC = () => {
  return (
    <div className="flex justify-center">
      <BigCard className="max-w-[1000px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex w-full flex-col gap-10"
        >
          <div>
            <p className="mb-3 font-mono text-xs tracking-[0.2em] text-primary">INTEGRATIONS</p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Team chat &amp; notifications
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              A multisig only moves when people show up to sign. These integrations bring the three
              moments that matter to wherever your team already is.
            </p>
          </div>

          {/* The lifecycle every integration hooks into */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {lifecycleEvents.map((event, index) => (
              <React.Fragment key={event}>
                {index > 0 && <span aria-hidden className="h-px w-6 bg-border" />}
                <span className="rounded-full border border-border px-3 py-1 font-mono text-[11px] tracking-wider text-muted-foreground">
                  {event}
                </span>
              </React.Fragment>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {notificationIntegrations.map((integration) => (
              <div key={integration.keyword} className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-primary">{integration.keyword}</span>
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
                  <h2 className="text-lg font-semibold text-foreground">{integration.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {integration.description}
                  </p>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {integration.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                      <CheckIcon className="mt-0.5 h-3 w-3 shrink-0 text-primary/70" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {integration.note && (
                  <p className="mt-auto border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground/80">
                    {integration.note}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed border-border p-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Which one should ship first? Tell us how your team would use it.
            </p>
            <Button variant="outline" asChild>
              <a href={requestIssueUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                Request an integration
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>

          <div className="border-t border-border pt-8">
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Build your own
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Everything the app does is public. If you need an integration we don&apos;t have, the
              pieces are already on the table.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              {buildYourOwn.map((item) => (
                <a
                  key={item.keyword}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg border border-border p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
                >
                  <span className="font-mono text-xs text-primary">{item.keyword}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    {item.title}
                    <ExternalLinkIcon className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary" />
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </BigCard>
    </div>
  )
}

export default Integration
