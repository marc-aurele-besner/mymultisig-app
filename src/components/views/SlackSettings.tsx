import React, { useCallback, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import BigCard from '../cards/BigCard'
import { Button } from '@/components/ui/button'
import { SlackWorkspace } from '../../models/Slack'
import { CheckIcon, DeleteIcon, ExternalLinkIcon, WarningIcon } from '../icons/ChakraIcons'

type Status =
  | { kind: 'loading' }
  | { kind: 'signedOut' }
  | { kind: 'ready'; workspaces: SlackWorkspace[] }
  | { kind: 'error'; message: string }

const formatDate = (iso: string | null): string => {
  if (iso == null) return 'unknown'
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

const SlackSettings: React.FC = () => {
  const { isConnected, address } = useAccount()
  const [status, setStatus] = useState<Status>({ kind: 'loading' })
  const [uninstalling, setUninstalling] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!isConnected) {
      setStatus({ kind: 'signedOut' })
      return
    }
    setStatus({ kind: 'loading' })
    try {
      const res = await fetch('/api/slack/workspaces', { credentials: 'include' })
      if (!res.ok) {
        const text = await res.text()
        setStatus({ kind: 'error', message: `Failed to load workspaces (${res.status}): ${text}` })
        return
      }
      const body = (await res.json()) as { workspaces: SlackWorkspace[] }
      setStatus({ kind: 'ready', workspaces: body.workspaces })
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
      setStatus({ kind: 'error', message: `Slack install failed: ${err}` })
    }
    // strip the query so a refresh doesn't re-trigger
    if (params.has('installed')) {
      const url = new URL(window.location.href)
      url.searchParams.delete('installed')
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.toString())
    }
  }, [load])

  const onUninstall = useCallback(
    async (teamId: string) => {
      if (!window.confirm(`Uninstall the Slack app from this workspace? The bot will stop responding in Slack.`)) return
      setUninstalling(teamId)
      try {
        const res = await fetch(`/api/slack/workspaces/${encodeURIComponent(teamId)}`, {
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

  return (
    <div className='flex justify-center'>
      <BigCard className='max-w-[1000px]'>
        <div className='flex w-full flex-col gap-6'>
          <div>
            <p className='mb-3 font-mono text-xs tracking-[0.2em] text-primary'>SETTINGS</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl'>Slack</h1>
            <p className='mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground'>
              Install the MyMultiSig Slack app into a workspace. The bot posts new-request notifications (coming next)
              and answers slash commands
              <span className='font-mono'>{' /balance'}</span>,<span className='font-mono'>{' /address-book'}</span>,
              <span className='font-mono'>{' /propose'}</span>, and
              <span className='font-mono'>{' /sign'}</span>.
            </p>
          </div>

          {status.kind === 'loading' && <p className='text-sm text-muted-foreground'>Loading installed workspaces…</p>}

          {status.kind === 'signedOut' && (
            <div className='rounded-lg border border-border p-4 text-sm text-muted-foreground'>
              Sign in with your wallet to view the Slack workspaces linked to it. The list is filtered to the wallet
              that installed each one.
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
                      ? 'No workspaces installed'
                      : `${status.workspaces.length} workspace${status.workspaces.length === 1 ? '' : 's'} installed`}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {address != null && `Linked to wallet ${address.slice(0, 6)}…${address.slice(-4)}`}
                  </span>
                </div>
                <Button
                  onClick={() => {
                    window.location.assign('/api/slack/install?return_to=/settings/slack')
                  }}
                  className='gap-2'
                >
                  <ExternalLinkIcon className='h-4 w-4' />
                  Install to a workspace
                </Button>
              </div>

              {status.workspaces.map((w) => (
                <div
                  key={w.teamId}
                  className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4'
                >
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-semibold text-foreground'>{w.teamName}</span>
                      {w.hasToken && (
                        <span className='inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary'>
                          <CheckIcon className='h-3 w-3' /> installed
                        </span>
                      )}
                    </div>
                    <span className='font-mono text-xs text-muted-foreground'>{w.teamId}</span>
                    <span className='text-xs text-muted-foreground'>
                      Installed {formatDate(w.installedAt)} · scope: <span className='font-mono'>{w.scope}</span>
                    </span>
                  </div>
                  <Button
                    variant='outline'
                    onClick={() => void onUninstall(w.teamId)}
                    disabled={uninstalling === w.teamId}
                    className='gap-2'
                  >
                    <DeleteIcon className='h-4 w-4' />
                    {uninstalling === w.teamId ? 'Uninstalling…' : 'Uninstall'}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className='rounded-lg border border-dashed border-border p-4 text-xs leading-relaxed text-muted-foreground'>
            <p>
              Slash commands currently respond from this app&apos;s server. Channel binding (so the bot can post into a
              specific channel) and the new-request notification loop are coming in the next release — see
              <a
                className='ml-1 underline'
                href='https://github.com/marc-aurele-besner/mymultisig-app/issues/40'
                target='_blank'
                rel='noopener noreferrer'
              >
                issue #40
              </a>
              .
            </p>
          </div>
        </div>
      </BigCard>
    </div>
  )
}

export default SlackSettings
