import React from 'react'
import Link from 'next/link'
import { KeyRoundIcon, LockIcon, ShieldIcon, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import AgentSession from '../agents/AgentSession'
import { ExternalLinkIcon } from '../icons/ChakraIcons'
import PageHero from '../layout/PageHero'
import IntegrationCard, { IntegrationInfo } from '../integration/IntegrationCard'

// Each agent flow is advertised on its own; they all reuse the scoped API keys
// from /settings/api-keys, and on-chain signing always stays on the agent's
// machine with its own owner key.
const agentIntegrations: IntegrationInfo[] = [
  {
    keyword: 'mcp',
    title: 'MCP server',
    status: 'alpha',
    description: 'Give Claude, Cursor or any MCP client native multisig tools.',
    features: [
      'Read wallets, balances and the request queue',
      'Decode requests with risk warnings and locally verified signatures',
      'Propose, approve and execute (simulated first) with the agent’s owner key',
      'Read-only mode and a chain allowlist for safe rollouts'
    ],
    note: 'npx -y mymultisig-mcp — add it to any MCP client config with your API key.',
    cta: { label: 'Setup guide', href: '/docs/ai-agents' },
    secondaryCta: { label: 'npm', href: 'https://www.npmjs.com/package/mymultisig-mcp', external: true }
  },
  {
    keyword: 'skills',
    title: 'Claude Code skills',
    status: 'alpha',
    description: 'Ready-made multisig workflows for Claude Code, MCP server included.',
    features: [
      'multisig-status: owners, balances and what the queue needs next',
      'create-multisig and propose-transaction with sanity checks',
      'review-and-sign: decode, flag risks, sign only after you confirm',
      'execute-queue: run ready requests in nonce order'
    ],
    note: '/plugin marketplace add marc-aurele-besner/mymultisig-app, then /plugin install mymultisig@mymultisig.',
    cta: { label: 'Setup guide', href: '/docs/ai-agents' },
    secondaryCta: {
      label: 'Source',
      href: 'https://github.com/marc-aurele-besner/mymultisig-app/tree/main/plugins/mymultisig',
      external: true
    }
  },
  {
    keyword: 'api',
    title: 'REST API & API keys',
    status: 'alpha',
    description: 'Call the request queue and wallet registry from any backend or bot.',
    features: [
      'Scoped Bearer keys: read, propose, sign, manage',
      'Restrict a key to specific wallets and give it an expiry',
      'Revoke instantly; keys can never sign transactions or mint keys',
      'OpenAPI 3.1 spec and llms.txt for code generators and LLMs'
    ],
    note: 'Keys act as the wallet that created them — the same key works for the MCP server and the CLI.',
    cta: { label: 'Create an API key', href: '/settings/api-keys' },
    secondaryCta: { label: 'OpenAPI spec', href: '/openapi.json', external: true }
  },
  {
    keyword: 'cli',
    title: 'Command line',
    status: 'alpha',
    description: 'Script your multisig from a terminal, CI job or agent shell.',
    features: [
      'Create wallets, propose, approve and execute requests',
      'Human-readable output, or --json for scripts and agents',
      'Irreversible actions ask first, or need --yes when unattended',
      'Mint and revoke API keys by signing in with your key'
    ],
    note: 'npx mymultisig-cli --help',
    cta: { label: 'Setup guide', href: '/docs/ai-agents' },
    secondaryCta: { label: 'npm', href: 'https://www.npmjs.com/package/mymultisig-cli', external: true }
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
  },
  {
    keyword: 'sdk',
    title: 'TypeScript SDK',
    description: 'mymultisig-sdk: the same EIP-712, signature and execution code this app runs, on viem.',
    href: 'https://www.npmjs.com/package/mymultisig-sdk'
  }
]

const safetyModel: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: KeyRoundIcon,
    title: 'Keys are scoped',
    text: 'read, propose, sign, manage. Restrict a key to specific wallets, give it an expiry, revoke it instantly. A key can never sign a transaction or mint another key.'
  },
  {
    icon: LockIcon,
    title: 'Signing stays local',
    text: 'To approve or execute, the agent uses its own owner key on its own machine. It is never sent to mymultisig.app.'
  },
  {
    icon: ShieldIcon,
    title: 'A human in every decision',
    text: 'Pick a threshold the agent can never meet alone. In a 2-of-3 with two humans plus the agent, it can prepare and co-sign, but nothing moves without a human signature.'
  }
]

const setupSteps = [
  { title: 'Create an API key', text: 'Mint a scoped key while signed in with your wallet.', href: '/settings/api-keys', link: 'Open API keys' },
  { title: 'Give the agent an owner key (optional)', text: 'Generate a fresh key and add its address as an owner so it can sign.' },
  { title: 'Connect the MCP server', text: 'Add mymultisig-mcp to Claude Code, Claude Desktop, Cursor or any MCP client.', href: '/settings/agents', link: 'Copy the setup' },
  { title: 'Ask the agent', text: 'Check status, propose, review, sign and execute through natural language.' }
]

// Agents & API: the tools that let software work the request queue, the
// safety model behind them, and where to get a key.
const Agents: React.FC = () => {
  return (
    <div className='flex w-full flex-col gap-12'>
      <PageHero
        eyebrow='AGENTS & API'
        title='A multisig your agents can work. You still hold the keys.'
        lead='Give Claude, Cursor, a CI job or your own bot native access to the request queue. They read, propose, review and co-sign. The contract still enforces the quorum, so the tools work the same for people and for agents.'
        actions={
          <>
            <Button asChild size='lg' className='gap-2'>
              <Link href='/settings/api-keys'>
                <KeyRoundIcon className='h-4 w-4' />
                Create an API key
              </Link>
            </Button>
            <Button asChild size='lg' variant='outline'>
              <Link href='/docs/ai-agents'>Read the setup guide</Link>
            </Button>
          </>
        }
        visual={<AgentSession />}
      />

      <section className='flex flex-col gap-4'>
        <h2 className='font-display text-xl font-bold tracking-tight text-foreground md:text-2xl'>The safety model</h2>
        <div className='grid gap-4 md:grid-cols-3'>
          {safetyModel.map((item) => (
            <div key={item.title} className='flex flex-col gap-2 rounded-xl border border-border bg-card p-5'>
              <item.icon className='h-5 w-5 text-primary' />
              <h3 className='text-base font-semibold text-foreground'>{item.title}</h3>
              <p className='text-xs leading-relaxed text-muted-foreground'>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='flex flex-col gap-4'>
        <div>
          <h2 className='font-display text-xl font-bold tracking-tight text-foreground md:text-2xl'>
            Four ways in, one set of credentials
          </h2>
          <p className='mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground'>
            Every flow below uses the scoped API keys you create in{' '}
            <Link href='/settings/api-keys' className='text-primary underline-offset-4 hover:underline'>
              Settings → API keys
            </Link>
            . Approvals and executions are signed locally with the agent&apos;s own owner key — never on our servers.
          </p>
        </div>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {agentIntegrations.map((integration) => (
            <IntegrationCard key={integration.keyword} integration={integration} />
          ))}
        </div>
      </section>

      <section className='flex flex-col gap-4'>
        <h2 className='font-display text-xl font-bold tracking-tight text-foreground md:text-2xl'>
          Set up in four steps
        </h2>
        <ol className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {setupSteps.map((step, index) => (
            <li key={step.title} className='flex flex-col gap-1.5 rounded-xl border border-border p-4'>
              <span className='font-mono text-xs text-primary'>0{index + 1}</span>
              <span className='text-sm font-semibold text-foreground'>{step.title}</span>
              <span className='text-xs leading-relaxed text-muted-foreground'>{step.text}</span>
              {step.href != null && (
                <Link href={step.href} className='mt-1 text-xs text-primary underline-offset-4 hover:underline'>
                  {step.link} →
                </Link>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className='flex flex-col gap-4'>
        <div>
          <h2 className='font-display text-xl font-bold tracking-tight text-foreground md:text-2xl'>Build your own</h2>
          <p className='mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground'>
            Everything the app does is public. If you need an integration we don&apos;t have, the pieces are already on
            the table.
          </p>
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {buildYourOwn.map((item) => (
            <a
              key={item.keyword}
              href={item.href}
              target='_blank'
              rel='noopener noreferrer'
              className='group rounded-lg border border-border p-4 transition-colors hover:border-primary/40 hover:bg-accent/40'
            >
              <span className='font-mono text-xs text-primary'>{item.keyword}</span>
              <span className='mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground'>
                {item.title}
                <ExternalLinkIcon className='h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary' />
              </span>
              <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>{item.description}</p>
            </a>
          ))}
        </div>
      </section>

      <div className='flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-5'>
        <p className='text-sm text-muted-foreground'>Want requests in Slack, Discord, Telegram or email instead?</p>
        <Button asChild variant='outline'>
          <Link href='/integration'>Team chat &amp; notifications</Link>
        </Button>
      </div>
    </div>
  )
}

export default Agents
