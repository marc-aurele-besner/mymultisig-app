import React, { useCallback, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import BigCard from '../cards/BigCard'
import { Button } from '@/components/ui/button'
import { DiscordChannelConfig, DiscordWorkspace } from '../../models/Discord'
import { CheckIcon, DeleteIcon, ExternalLinkIcon, WarningIcon } from '../icons/ChakraIcons'

type Status =
  | { kind: 'loading' }
  | { kind: 'signedOut' }
  | { kind: 'ready'; workspaces: DiscordWorkspace[]; bindings: DiscordChannelConfig[] }
  | { kind: 'error'; message: string }

const formatDate = (iso: string | null): string => {
  if (iso == null) return 'unknown'
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

const shortenAddress = (address: string): string => `${address.slice(0, 6)}…${address.slice(-4)}`

const DiscordSettings: React.FC = () => {
  const { isConnected, address } = useAccount()
  const [status, setStatus] = useState<Status>({ kind: 'loading' })
  const [uninstalling, setUninstalling] = useState<string | null>(null)
  const [unbinding, setUnbinding] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!isConnected) {
      setStatus({ kind: 'signedOut' })
      return
    }
    setStatus({ kind: 'loading' })
    try {
      const [wsRes, bindRes] = await Promise.all([
        fetch('/api/discord/workspaces', { credentials: 'include' }),
        fetch('/api/discord/channel-bindings', { credentials: 'include' })
      ])
      if (!wsRes.ok) {
        const text = await wsRes.text()
        setStatus({ kind: 'error', message: `Failed to load workspaces (${wsRes.status}): ${text}` })
        return
      }
      const wsBody = (await wsRes.json()) as { workspaces: DiscordWorkspace[] }
      const bindings = bindRes.ok ? ((await bindRes.json()) as { bindings: DiscordChannelConfig[] }).bindings : []
      setStatus({ kind: 'ready', workspaces: wsBody.workspaces, bindings })
    } catch (e) {
      setStatus({ kind: 'error', message: (e as Error).message })
    }
  }, [isConnected])

  useEffect(() => {
    void load()
  }, [load])

  // Re-load on ?installed=1 (returned from the OAuth callback) and on
  // ?installed=0 (and show the error inline).
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('installed') === '1') {
      void load()
    } else if (params.get('installed') === '0') {
      const err = params.get('error') ?? 'unknown'
      setStatus({ kind: 'error', message: `Discord install failed: ${err}` })
    }
    if (params.has('installed')) {
      const url = new URL(window.location.href)
      url.searchParams.delete('installed')
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.toString())
    }
  }, [load])

  const onUninstall = useCallback(
    async (guildId: string) => {
      if (!window.confirm('Uninstall the Discord bot from this server? The bot will stop responding in Discord.'))
        return
      setUninstalling(guildId)
      try {
        const res = await fetch(`/api/discord/workspaces/${encodeURIComponent(guildId)}`, {
          method: 'DELETE',
          credentials: 'include'
        })
        if (!res.ok && res.status !== 204) {
          const text = await res.text()
          alert(`Uninstall failed (${res.status}): ${text}`)
        }
        await load()
      } finally {
        setUninstalling(null)
      }
    },
    [load]
  )

  const onUnbind = useCallback(
    async (bindingId: string) => {
      if (!window.confirm('Unbind this channel from the multisig? New-request notifications will stop posting here.'))
        return
      setUnbinding(bindingId)
      try {
        const res = await fetch(`/api/discord/channel-bindings/${encodeURIComponent(bindingId)}`, {
          method: 'DELETE',
          credentials: 'include'
        })
        if (!res.ok && res.status !== 204) {
          const text = await res.text()
          alert(`Unbind failed (${res.status}): ${text}`)
        }
        await load()
      } finally {
        setUnbinding(null)
      }
    },
    [load]
  )

  return (
    <div className='flex justify-center'>
      <BigCard className='max-w-[1000px]'>
        <div className='flex w-full flex-col gap-6'>
          <div>
            <p className='mb-3 font-mono text-xs tracking-[0.2em] text-primary'>SETTINGS</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl'>Discord</h1>
            <p className='mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground'>
              Add the MyMultiSig bot to a Discord server, then bind a channel to a multisig. Slash commands work in any
              channel the bot can see
              <span className='font-mono'>{' /balance'}</span>,<span className='font-mono'>{' /address-book'}</span>,
              <span className='font-mono'>{' /bind'}</span>,<span className='font-mono'>{' /unbind'}</span>,
              <span className='font-mono'>{' /propose'}</span>, and
              <span className='font-mono'>{' /sign'}</span>; new-request notifications post into bound channels.
            </p>
          </div>

          {status.kind === 'loading' && <p className='text-sm text-muted-foreground'>Loading installed servers…</p>}

          {status.kind === 'signedOut' && (
            <div className='rounded-lg border border-border p-4 text-sm text-muted-foreground'>
              Sign in with your wallet to view the Discord servers linked to it. The list is filtered to the wallet
              that added the bot to each server.
            </div>
          )}

          {status.kind === 'error' && (
            <div className='flex items-start gap-2 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive'>
              <WarningIcon className='mt-0.5 h-4 w-4 shrink-0' />
              <span>{status.message}</span>
            </div>
          )}

          {status.kind === 'ready' && (
            <div className='flex flex-col gap-3'>
              <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4'>
                <div className='flex flex-col gap-1'>
                  <span className='text-sm font-semibold text-foreground'>
                    {status.workspaces.length === 0
                      ? 'No servers installed'
                      : `${status.workspaces.length} server${status.workspaces.length === 1 ? '' : 's'} installed`}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {address != null && `Linked to wallet ${address.slice(0, 6)}…${address.slice(-4)}`}
                  </span>
                </div>
                <Button
                  onClick={() => {
                    window.location.assign('/api/discord/install?return_to=/settings/discord')
                  }}
                  className='gap-2'
                >
                  <ExternalLinkIcon className='h-4 w-4' />
                  Add to a server
                </Button>
              </div>

              {status.workspaces.map((w) => (
                <div
                  key={w.guildId}
                  className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4'
                >
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-semibold text-foreground'>{w.guildName}</span>
                      {w.hasToken && (
                        <span className='inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary'>
                          <CheckIcon className='h-3 w-3' /> installed
                        </span>
                      )}
                    </div>
                    <span className='font-mono text-xs text-muted-foreground'>{w.guildId}</span>
                    <span className='text-xs text-muted-foreground'>
                      Installed {formatDate(w.installedAt)} · scope: <span className='font-mono'>{w.scope}</span>
                    </span>
                  </div>
                  <Button
                    variant='outline'
                    onClick={() => void onUninstall(w.guildId)}
                    disabled={uninstalling === w.guildId}
                    className='gap-2'
                  >
                    <DeleteIcon className='h-4 w-4' />
                    {uninstalling === w.guildId ? 'Uninstalling…' : 'Uninstall'}
                  </Button>
                </div>
              ))}

              <div className='mt-2 flex flex-col gap-2'>
                <div className='flex items-center justify-between gap-3 rounded-lg border border-border p-4'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-sm font-semibold text-foreground'>Channel bindings</span>
                    <span className='text-xs text-muted-foreground'>
                      Channels that will receive new-request notifications for the multisigs they&apos;re bound to.
                    </span>
                  </div>
                  <span className='font-mono text-xs text-muted-foreground'>
                    {status.bindings.length === 0
                      ? 'No bindings'
                      : `${status.bindings.length} binding${status.bindings.length === 1 ? '' : 's'}`}
                  </span>
                </div>
                {status.bindings.map((b) => (
                  <div
                    key={b.id}
                    className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4'
                  >
                    <div className='flex flex-col gap-1'>
                      <span className='text-sm font-semibold text-foreground'>
                        {b.channelName != null ? `#${b.channelName}` : 'channel'}
                      </span>
                      <span className='font-mono text-xs text-muted-foreground'>{b.channelId}</span>
                      <span className='text-xs text-muted-foreground'>
                        Bound to <span className='font-mono'>{shortenAddress(b.multisigAddress)}</span> on chain{' '}
                        <span className='font-mono'>{b.chainId}</span> · created by{' '}
                        <span className='font-mono'>{b.createdBy}</span>
                      </span>
                    </div>
                    <Button
                      variant='outline'
                      onClick={() => void onUnbind(b.id)}
                      disabled={unbinding === b.id}
                      className='gap-2'
                    >
                      <DeleteIcon className='h-4 w-4' />
                      {unbinding === b.id ? 'Unbinding…' : 'Unbind'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='rounded-lg border border-dashed border-border p-4 text-xs leading-relaxed text-muted-foreground'>
            <p>
              Type <span className='font-mono'>/bind &lt;chain&gt; &lt;multisig&gt;</span> in any channel where the bot
              is present to receive new-request notifications there. <span className='font-mono'>/unbind</span> removes
              the binding.
            </p>
          </div>
        </div>
      </BigCard>
    </div>
  )
}

export default DiscordSettings