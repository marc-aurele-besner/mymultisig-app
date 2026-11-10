import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { BotIcon, KeyRoundIcon, ShieldIcon } from 'lucide-react'

import BigCard from '../cards/BigCard'
import { Button } from '@/components/ui/button'
import { CopyButton, mcpConfig } from './ApiKeySettings'
import { AgentApiKey, listAgentApiKeys } from '../../utils/api'

const KEY_PLACEHOLDER = 'mms_…'

const CLIENTS: { title: string; hint: string; snippet: string }[] = [
  {
    title: 'Claude Code (plugin)',
    hint: 'Bundles the MCP server and the multisig workflow skills.',
    snippet: '/plugin marketplace add marc-aurele-besner/mymultisig-app\n/plugin install mymultisig@mymultisig'
  },
  {
    title: 'Claude Code (server only)',
    hint: 'Adds just the MCP server.',
    snippet: `claude mcp add mymultisig -e MYMULTISIG_API_KEY=${KEY_PLACEHOLDER} -- npx -y mymultisig-mcp`
  },
  {
    title: 'Claude Desktop, Cursor and other MCP clients',
    hint: 'Add this to the client’s MCP config.',
    snippet: mcpConfig(KEY_PLACEHOLDER)
  },
  {
    title: 'Command line',
    hint: 'The same engine for scripts and CI. Reads MYMULTISIG_API_KEY from the environment.',
    snippet: 'npx mymultisig-cli --help'
  }
]

const OPTIONS: { name: string; text: string }[] = [
  { name: 'MYMULTISIG_API_KEY', text: 'The scoped key the agent acts with on mymultisig.app.' },
  {
    name: 'MYMULTISIG_PRIVATE_KEY',
    text: 'Optional. The agent’s own owner key, used locally to approve and execute. Never sent to the server.'
  },
  { name: 'MYMULTISIG_READ_ONLY=1', text: 'Expose read tools only.' },
  { name: 'MYMULTISIG_CHAINS', text: 'Limit the agent to the listed chain ids, e.g. 11155111.' },
  { name: 'MYMULTISIG_RPC_URL_<chainId>', text: 'Use your own RPC endpoint for a chain.' }
]

const isActive = (key: AgentApiKey) =>
  key.revokedAt == null && (key.expiresAt == null || new Date(key.expiresAt).getTime() > Date.now())

// How to plug an agent into MyMultiSig: the client setup snippets and the
// environment options. The keys themselves are managed on /settings/api-keys.
const AgentSettings: React.FC = () => {
  const { isConnected } = useAccount()
  // null until known (not connected, not signed in, or still loading).
  const [activeKeys, setActiveKeys] = useState<number | null>(null)

  useEffect(() => {
    if (!isConnected) {
      setActiveKeys(null)
      return
    }
    let cancelled = false
    listAgentApiKeys()
      .then((keys) => {
        if (!cancelled) setActiveKeys(keys.filter(isActive).length)
      })
      .catch(() => {
        if (!cancelled) setActiveKeys(null)
      })
    return () => {
      cancelled = true
    }
  }, [isConnected])

  return (
    <div className='flex justify-center'>
      <BigCard className='max-w-[1000px]'>
        <div className='flex w-full flex-col gap-6'>
          <div>
            <p className='mb-3 font-mono text-xs tracking-[0.2em] text-primary'>SETTINGS</p>
            <h1 className='flex items-center gap-3 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl'>
              <span className='grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-primary'>
                <BotIcon className='h-6 w-6' />
              </span>
              AI agents
            </h1>
            <p className='mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground'>
              Let Claude, Cursor or any MCP-capable agent read your multisigs and queue requests through the{' '}
              <span className='font-mono text-foreground'>mymultisig-mcp</span> server. The agent acts with an API key
              you scope; to approve or execute it uses its own owner key, which stays on its machine. See the{' '}
              <Link href='/docs/ai-agents' className='text-primary underline-offset-4 hover:underline'>
                AI agents guide
              </Link>
              .
            </p>
          </div>

          <div className='flex flex-wrap items-center justify-between gap-4 rounded-lg border border-primary/40 bg-primary/5 p-4'>
            <div className='flex min-w-0 flex-1 basis-64 items-start gap-3'>
              <KeyRoundIcon className='mt-0.5 h-5 w-5 shrink-0 text-primary' />
              <div>
                <p className='text-sm font-semibold text-foreground'>
                  {activeKeys == null
                    ? 'Step 1: an API key'
                    : activeKeys === 0
                      ? 'No active API key yet'
                      : `${activeKeys} active API key${activeKeys === 1 ? '' : 's'}`}
                </p>
                <p className='text-xs leading-relaxed text-muted-foreground'>
                  Every client below needs one. Replace <span className='font-mono'>{KEY_PLACEHOLDER}</span> in the
                  snippets with your key. A new key is shown once, with these snippets already filled in.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href='/settings/api-keys'>{activeKeys ? 'Manage API keys' : 'Create an API key'}</Link>
            </Button>
          </div>

          <section className='flex flex-col gap-3'>
            <h2 className='text-lg font-semibold text-foreground'>Connect a client</h2>
            {CLIENTS.map((client) => (
              <div key={client.title} className='flex flex-col gap-2 rounded-lg border border-border p-4'>
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div>
                    <h3 className='text-sm font-semibold text-foreground'>{client.title}</h3>
                    <p className='text-xs text-muted-foreground'>{client.hint}</p>
                  </div>
                  <CopyButton value={client.snippet} />
                </div>
                <pre className='overflow-x-auto rounded bg-background p-3 font-mono text-xs text-foreground'>
                  {client.snippet}
                </pre>
              </div>
            ))}
          </section>

          <section className='flex flex-col gap-3'>
            <h2 className='text-lg font-semibold text-foreground'>Options</h2>
            <dl className='flex flex-col divide-y divide-border rounded-lg border border-border'>
              {OPTIONS.map((option) => (
                <div key={option.name} className='grid gap-1 p-3 sm:grid-cols-[260px_minmax(0,1fr)] sm:gap-4'>
                  <dt className='break-all font-mono text-xs text-primary'>{option.name}</dt>
                  <dd className='text-xs leading-relaxed text-muted-foreground'>{option.text}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className='flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4'>
            <ShieldIcon className='mt-0.5 h-5 w-5 shrink-0 text-primary' />
            <p className='text-xs leading-relaxed text-muted-foreground'>
              The safest setup is a threshold the agent can never meet alone: in a 2-of-3 with two humans plus the
              agent, it can prepare and co-sign, but nothing moves without a human signature. Start on a testnet and
              set <span className='font-mono'>MYMULTISIG_CHAINS</span>. More on the{' '}
              <Link href='/agents' className='text-primary underline-offset-4 hover:underline'>
                Agents &amp; API
              </Link>{' '}
              page.
            </p>
          </div>
        </div>
      </BigCard>
    </div>
  )
}

export default AgentSettings
