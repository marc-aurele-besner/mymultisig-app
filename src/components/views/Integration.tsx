import React from 'react'
import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExternalLinkIcon } from '../icons/ChakraIcons'
import BrandIcon from '../icons/BrandIcon'
import IntegrationCard, { IntegrationInfo } from '../integration/IntegrationCard'
import NotificationFeed from '../integration/NotificationFeed'
import PageHero from '../layout/PageHero'

const lifecycleEvents = ['request proposed', 'awaiting signatures', 'ready to execute']

const notificationIntegrations: IntegrationInfo[] = [
  {
    keyword: 'slack',
    icon: <BrandIcon brand='slack' size={20} />,
    title: 'Slack',
    status: 'available',
    description: 'Bring requests to the channel where your team already talks.',
    features: [
      'Post each new request to a channel of your choice',
      'A second message when a request is ready to execute',
      'One-click link to the request page to sign',
      'Bind a channel with /bind <chain> <multisig>'
    ],
    note: 'Add the app to your workspace from /settings/slack, then run /bind in the channel that should get notifications.',
    cta: { label: 'Add to Slack', href: '/settings/slack' }
  },
  {
    keyword: 'discord',
    icon: <BrandIcon brand='discord' size={20} />,
    title: 'Discord',
    status: 'alpha',
    description: 'The same flow for DAOs and communities that live on Discord.',
    features: [
      'Slash commands: /balance, /address-book, /bind, /unbind, /propose, /sign',
      'Embeds with chain name, balance, and one-click "Open in app"',
      'Bind a channel with /bind <chain> <multisig>',
      'Per-command ephemeral vs in-channel responses'
    ],
    note: 'The bot install, slash commands, and channel binding (/bind) are live. New-request notifications post into bound channels. See /settings/discord to try it in your server.',
    cta: { label: 'Try the alpha', href: '/settings/discord' }
  },
  {
    keyword: 'telegram',
    icon: <BrandIcon brand='telegram' size={20} />,
    title: 'Telegram',
    status: 'alpha',
    description: 'The same flow for teams that coordinate in Telegram DMs and groups.',
    features: [
      'Slash commands: /balance, /address-book, /bind, /unbind, /propose, /sign',
      'HTML replies with chain name, balance, and inline "Open in app" button',
      'Bind a chat with /bind <chain> <multisig>',
      'One bot at a time: registering a new bot auto-disables the previous one'
    ],
    note: 'The bot install, slash commands, and chat binding (/bind) are live. New-request notifications post into bound chats. See /settings/telegram to register your bot.',
    cta: { label: 'Try the alpha', href: '/settings/telegram' }
  },
  {
    keyword: 'email',
    icon: <BrandIcon brand='email' size={20} />,
    title: 'Email',
    status: 'available',
    description: 'No bot to install — notifications straight to each signer’s inbox.',
    features: [
      '“Signature needed” when a request waits on you',
      '“Ready to execute” when the signing threshold is met',
      'Confirm your address first; every email has an unsubscribe link'
    ],
    note: 'Sign in with an owner wallet on /settings/email, enter your address, and click the confirmation link.',
    cta: { label: 'Set up email', href: '/settings/email' }
  }
]

const requestIssueUrl =
  'https://github.com/marc-aurele-besner/mymultisig-app/issues/new' +
  `?title=${encodeURIComponent('Integration request: ')}` +
  `&body=${encodeURIComponent(
    'Which integration do you need (Slack / Discord / Telegram / Email / other)?\n\nHow does your team use MyMultiSig?\n'
  )}`

// Team chat and notification channels. Agent and developer tooling (MCP,
// skills, API keys, CLI, SDK) has its own page at /agents.
const Integration: React.FC = () => {
  return (
    <div className='flex w-full flex-col gap-8'>
      <PageHero
        eyebrow='INTEGRATIONS'
        title='Team chat & notifications'
        lead='A multisig only moves when people show up to sign. These integrations bring the three moments that matter to wherever your team already is.'
        actions={
          <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
            {/* The lifecycle every integration hooks into */}
            {lifecycleEvents.map((event, index) => (
              <React.Fragment key={event}>
                {index > 0 && <span aria-hidden className='h-px w-6 bg-border' />}
                <span className='rounded-full border border-border px-3 py-1 font-mono text-[11px] tracking-wider text-muted-foreground'>
                  {event}
                </span>
              </React.Fragment>
            ))}
          </div>
        }
        visual={<NotificationFeed />}
      />

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {notificationIntegrations.map((integration) => (
          <IntegrationCard key={integration.keyword} integration={integration} />
        ))}
      </div>

      <div className='flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed border-border p-5'>
        <p className='text-sm leading-relaxed text-muted-foreground'>
          Which one should ship first? Tell us how your team would use it.
        </p>
        <Button variant='outline' asChild>
          <a href={requestIssueUrl} target='_blank' rel='noopener noreferrer' className='gap-2'>
            Request an integration
            <ExternalLinkIcon className='h-3.5 w-3.5' />
          </a>
        </Button>
      </div>

      <Link
        href='/agents'
        className='flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/40 bg-primary/5 p-5 transition-colors hover:border-primary/70'
      >
        <div className='min-w-0 flex-1 basis-64'>
          <p className='font-mono text-xs tracking-[0.2em] text-primary'>AGENTS &amp; API</p>
          <h2 className='mt-1 font-display text-xl font-bold tracking-tight text-foreground'>
            Looking for MCP, the CLI or the API?
          </h2>
          <p className='mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground'>
            Claude, Cursor or your own scripts can read the queue, propose and co-sign with scoped API keys.
          </p>
        </div>
        <span className='inline-flex items-center gap-2 text-sm font-semibold text-primary'>
          Explore agents
          <ArrowRightIcon className='h-4 w-4' />
        </span>
      </Link>
    </div>
  )
}

export default Integration
