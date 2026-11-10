import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { KeyRoundIcon } from 'lucide-react'
import { isAddress } from 'viem'

import BigCard from '../cards/BigCard'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/ui/code-block'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { CheckIcon, CopyIcon, WarningIcon } from '../icons/ChakraIcons'
import {
  AgentApiKey,
  AgentApiKeyScope,
  createAgentApiKey,
  listAgentApiKeys,
  revokeAgentApiKey
} from '../../utils/api'

const SCOPES: { scope: AgentApiKeyScope; label: string; description: string }[] = [
  { scope: 'read', label: 'Read', description: 'List your wallets, address book and saved contracts.' },
  { scope: 'propose', label: 'Propose', description: 'Queue new requests on wallets you own.' },
  { scope: 'sign', label: 'Sign', description: 'Store signatures and record executions on requests.' },
  { scope: 'manage', label: 'Manage', description: 'Cancel, reset or delete requests and register wallets.' }
]

const EXPIRY_OPTIONS: { label: string; days: number | null }[] = [
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: '1 year', days: 365 },
  { label: 'Never', days: null }
]

type LoadState =
  | { kind: 'loading' }
  | { kind: 'signedOut' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; keys: AgentApiKey[] }

const formatDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString() : '—')

export const mcpConfig = (apiKey: string) =>
  JSON.stringify(
    {
      mcpServers: {
        mymultisig: {
          command: 'npx',
          args: ['-y', 'mymultisig-mcp'],
          env: {
            MYMULTISIG_API_KEY: apiKey,
            MYMULTISIG_PRIVATE_KEY: '<optional: the agent’s own owner key>'
          }
        }
      }
    },
    null,
    2
  )

export const CopyButton: React.FC<{ value: string; label?: string }> = ({ value, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      type='button'
      variant='outline'
      size='sm'
      className='gap-2'
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
    >
      {copied ? <CheckIcon className='h-4 w-4' /> : <CopyIcon className='h-4 w-4' />}
      {copied ? 'Copied' : label}
    </Button>
  )
}

export interface AgentKeyListProps {
  keys: AgentApiKey[]
  onRevoke: (id: string) => void
  revokingId: string | null
}

export const AgentKeyList: React.FC<AgentKeyListProps> = ({ keys, onRevoke, revokingId }) => {
  if (keys.length === 0)
    return <p className='text-sm text-muted-foreground'>No keys yet. Create one above.</p>
  return (
    <ul className='flex flex-col divide-y divide-border rounded-lg border border-border'>
      {keys.map((key) => {
        const expired = key.expiresAt != null && new Date(key.expiresAt).getTime() <= Date.now()
        const inactive = key.revokedAt != null || expired
        return (
          <li key={key.id} className='flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='min-w-0'>
              <p className='font-medium text-foreground'>
                {key.name}{' '}
                {key.revokedAt != null && <span className='ml-1 text-xs text-destructive'>revoked</span>}
                {key.revokedAt == null && expired && <span className='ml-1 text-xs text-destructive'>expired</span>}
              </p>
              <p className='font-mono text-xs text-muted-foreground'>{key.keyPrefix}…</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                {key.scopes.join(', ')}
                {key.walletAddresses.length > 0 && ` · ${key.walletAddresses.length} wallet(s)`} · created{' '}
                {formatDate(key.createdAt)} · last used {formatDate(key.lastUsedAt)} · expires{' '}
                {key.expiresAt ? formatDate(key.expiresAt) : 'never'}
              </p>
            </div>
            {!inactive && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => onRevoke(key.id)}
                disabled={revokingId === key.id}
              >
                {revokingId === key.id ? 'Revoking…' : 'Revoke'}
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

// Create, list and revoke the scoped API keys that scripts and agents use to
// act as this wallet. Connecting an agent with a key is on /settings/agents.
const ApiKeySettings: React.FC = () => {
  const { isConnected } = useAccount()
  const [state, setState] = useState<LoadState>({ kind: 'loading' })
  const [name, setName] = useState('')
  const [scopes, setScopes] = useState<AgentApiKeyScope[]>(['read', 'propose'])
  const [wallets, setWallets] = useState('')
  const [expiryDays, setExpiryDays] = useState<number | null>(90)
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!isConnected) {
      setState({ kind: 'signedOut' })
      return
    }
    setState({ kind: 'loading' })
    try {
      setState({ kind: 'ready', keys: await listAgentApiKeys() })
    } catch (e) {
      setState({ kind: 'error', message: (e as Error).message })
    }
  }, [isConnected])

  useEffect(() => {
    void load()
  }, [load])

  const toggleScope = (scope: AgentApiKeyScope, on: boolean) =>
    setScopes((current) => (on ? [...new Set([...current, scope])] : current.filter((s) => s !== scope)))

  const onCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const walletAddresses = wallets
      .split(/[\s,]+/)
      .map((w) => w.trim())
      .filter((w) => w !== '')
    if (name.trim() === '') return setFormError('Give the key a name, e.g. “Claude Code on my laptop”.')
    if (scopes.length === 0) return setFormError('Pick at least one scope.')
    const invalid = walletAddresses.find((w) => !isAddress(w))
    if (invalid) return setFormError(`${invalid} is not a valid address.`)
    setFormError(null)
    setCreating(true)
    try {
      const { key } = await createAgentApiKey({ name: name.trim(), scopes, walletAddresses, expiresInDays: expiryDays })
      setNewKey(key)
      setName('')
      setWallets('')
      await load()
    } catch (e) {
      setFormError((e as Error).message)
    } finally {
      setCreating(false)
    }
  }

  const onRevoke = async (id: string) => {
    if (!window.confirm('Revoke this key? Agents using it will lose access immediately.')) return
    setRevokingId(id)
    try {
      await revokeAgentApiKey(id)
      await load()
    } catch (e) {
      setFormError((e as Error).message)
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <div className='flex justify-center'>
      <BigCard className='max-w-[1000px]'>
        <div className='flex w-full flex-col gap-6'>
          <div>
            <p className='mb-3 font-mono text-xs tracking-[0.2em] text-primary'>SETTINGS</p>
            <h1 className='flex items-center gap-3 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl'>
              <span className='grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-primary'>
                <KeyRoundIcon className='h-6 w-6' />
              </span>
              API keys
            </h1>
            <p className='mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground'>
              Scoped keys for the REST API, the CLI, the SDK and AI agents. A key acts as this wallet, limited to the
              scopes you pick, and can be restricted to specific multisigs and given an expiry. Keys never sign
              transactions and can never mint other keys. To plug a key into Claude, Cursor or another MCP client, see{' '}
              <Link href='/settings/agents' className='text-primary underline-offset-4 hover:underline'>
                AI agents
              </Link>
              .
            </p>
          </div>

          {state.kind === 'loading' && <p className='text-sm text-muted-foreground'>Loading API keys…</p>}

          {state.kind === 'signedOut' && (
            <div className='rounded-lg border border-border p-4 text-sm text-muted-foreground'>
              Connect and sign in with your wallet to create API keys.
            </div>
          )}

          {state.kind === 'error' && (
            <div className='flex items-start gap-2 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive'>
              <WarningIcon className='mt-0.5 h-4 w-4 shrink-0' />
              <span>{state.message}</span>
            </div>
          )}

          {newKey != null && (
            <div className='flex flex-col gap-3 rounded-lg border border-primary/40 bg-primary/10 p-4'>
              <p className='text-sm text-foreground'>
                Copy your new key now. It won&apos;t be shown again.
              </p>
              <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                <code className='break-all rounded bg-background px-2 py-1 font-mono text-sm'>{newKey}</code>
                <CopyButton value={newKey} />
              </div>
              <p className='text-sm text-muted-foreground'>Claude Code:</p>
              <CodeBlock
                title='terminal'
                code={`claude mcp add mymultisig -e MYMULTISIG_API_KEY=${newKey} -- npx -y mymultisig-mcp`}
              />
              <p className='text-sm text-muted-foreground'>Claude Desktop, Cursor and other MCP clients:</p>
              <CodeBlock title='mcp config · json' code={mcpConfig(newKey)} />
              <Link href='/settings/agents' className='text-sm text-primary underline-offset-4 hover:underline'>
                More clients and options →
              </Link>
            </div>
          )}

          {state.kind === 'ready' && (
            <>
              <form className='flex flex-col gap-4 rounded-lg border border-border p-4' onSubmit={onCreate} noValidate>
                <h2 className='text-lg font-semibold text-foreground'>Create a key</h2>
                <div className='flex flex-col gap-2'>
                  <Label htmlFor='agent-key-name'>Name</Label>
                  <Input
                    id='agent-key-name'
                    placeholder='Claude Code on my laptop'
                    maxLength={64}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <fieldset className='flex flex-col gap-3'>
                  <legend className='mb-2 text-sm font-medium'>Scopes</legend>
                  {SCOPES.map(({ scope, label, description }) => (
                    <div key={scope} className='flex items-start gap-3'>
                      <Switch
                        id={`agent-scope-${scope}`}
                        checked={scopes.includes(scope)}
                        onCheckedChange={(on) => toggleScope(scope, on)}
                      />
                      <Label htmlFor={`agent-scope-${scope}`} className='flex flex-col items-start gap-0.5'>
                        <span>{label}</span>
                        <span className='text-xs font-normal text-muted-foreground'>{description}</span>
                      </Label>
                    </div>
                  ))}
                </fieldset>
                <div className='flex flex-col gap-2'>
                  <Label htmlFor='agent-key-wallets'>Restrict to wallets (optional)</Label>
                  <Textarea
                    id='agent-key-wallets'
                    placeholder='0x… one multisig address per line. Leave empty to allow every wallet you own.'
                    value={wallets}
                    onChange={(e) => setWallets(e.target.value)}
                  />
                </div>
                <div className='flex flex-col gap-2'>
                  <Label htmlFor='agent-key-expiry'>Expires after</Label>
                  <select
                    id='agent-key-expiry'
                    className='h-9 rounded-md border border-input bg-background px-3 text-sm'
                    value={expiryDays == null ? 'never' : String(expiryDays)}
                    onChange={(e) => setExpiryDays(e.target.value === 'never' ? null : Number(e.target.value))}
                  >
                    {EXPIRY_OPTIONS.map((o) => (
                      <option key={o.label} value={o.days == null ? 'never' : String(o.days)}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                {formError != null && (
                  <div className='flex items-start gap-2 text-sm text-destructive'>
                    <WarningIcon className='mt-0.5 h-4 w-4 shrink-0' />
                    <span>{formError}</span>
                  </div>
                )}
                <div>
                  <Button type='submit' disabled={creating}>
                    {creating ? 'Creating…' : 'Create key'}
                  </Button>
                </div>
              </form>

              <div className='flex flex-col gap-3'>
                <h2 className='text-lg font-semibold text-foreground'>Your keys</h2>
                <AgentKeyList keys={state.keys} onRevoke={onRevoke} revokingId={revokingId} />
              </div>
            </>
          )}
        </div>
      </BigCard>
    </div>
  )
}

export default ApiKeySettings
