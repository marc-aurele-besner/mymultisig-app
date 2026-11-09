import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'

import BigCard from '../cards/BigCard'
import { Button } from '@/components/ui/button'
import networks from '../../constants/networks'
import { SlackChannelConfig, SlackWorkspace } from '../../models/Slack'
import useMultiSigs from '../../states/multiSigs'
import SlackBindGuide, { BindableMultiSig, slackWorkspaceUrl } from '../slack/SlackBindGuide'
import { CheckCircleIcon, CheckIcon, DeleteIcon, ExternalLinkIcon, WarningIcon } from '../icons/ChakraIcons'

type Status =
  | { kind: 'loading' }
  | { kind: 'signedOut' }
  | { kind: 'ready'; workspaces: SlackWorkspace[]; bindings: SlackChannelConfig[] }
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

const SlackSettings: React.FC = () => {
  const { isConnected, address } = useAccount()
  const [status, setStatus] = useState<Status>({ kind: 'loading' })
  const [uninstalling, setUninstalling] = useState<string | null>(null)
  const [unbinding, setUnbinding] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [justInstalled, setJustInstalled] = useState(false)
  const { multiSigs } = useMultiSigs()

  // The wallet's multisigs, deduplicated, for the prefilled /bind commands.
  const bindable = useMemo<BindableMultiSig[]>(() => {
    const seen = new Set<string>()
    return multiSigs
      .filter((m) => {
        const key = `${m.chainId}:${m.address.toLowerCase()}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map((m) => ({ address: m.address, chainId: m.chainId, chainName: m.chainName, name: m.name }))
  }, [multiSigs])

  const chainLabel = (chainId: number): string => networks.find((c) => c.id === chainId)?.name ?? `chain ${chainId}`
  const multiSigLabel = (address: string, chainId: number): string => {
    const known = bindable.find((m) => m.chainId === chainId && m.address.toLowerCase() === address.toLowerCase())
    return known?.name ? `${known.name} (${shortenAddress(address)})` : shortenAddress(address)
  }
  const teamName = (teamId: string): string =>
    (status.kind === 'ready' ? status.workspaces.find((w) => w.teamId === teamId)?.teamName : undefined) ?? teamId

  // `silent` refreshes in place (no loading flash, keeps the current view on
  // a failed fetch). Used by the refresh button and when the tab regains
  // focus after the user ran /bind in Slack.
  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!isConnected) {
        setStatus({ kind: 'signedOut' })
        return
      }
      if (!silent) setStatus({ kind: 'loading' })
      try {
        const [wsRes, bindRes] = await Promise.all([
          fetch('/api/slack/workspaces', { credentials: 'include' }),
          fetch('/api/slack/channel-bindings', { credentials: 'include' })
        ])
        if (!wsRes.ok) {
          if (silent) return
          const text = await wsRes.text()
          setStatus({ kind: 'error', message: `Failed to load workspaces (${wsRes.status}): ${text}` })
          return
        }
        const wsBody = (await wsRes.json()) as { workspaces: SlackWorkspace[] }
        const bindings = bindRes.ok ? ((await bindRes.json()) as { bindings: SlackChannelConfig[] }).bindings : []
        setStatus({ kind: 'ready', workspaces: wsBody.workspaces, bindings })
      } catch (e) {
        if (!silent) setStatus({ kind: 'error', message: (e as Error).message })
      }
    },
    [isConnected]
  )

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await load({ silent: true })
    } finally {
      setRefreshing(false)
    }
  }, [load])

  useEffect(() => {
    void load()
  }, [load])

  // Binding happens in Slack, so pick up new bindings when the user comes
  // back to this tab.
  const hasWorkspaces = status.kind === 'ready' && status.workspaces.length > 0
  useEffect(() => {
    if (!hasWorkspaces) return
    const onFocus = () => void load({ silent: true })
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [hasWorkspaces, load])

  // Re-load on ?installed=1 (returned from the OAuth callback) and on
  // ?installed=0 (and show the error inline).
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('installed') === '1') {
      setJustInstalled(true)
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

  const onUnbind = useCallback(
    async (bindingId: string) => {
      if (!window.confirm('Unbind this channel from the multisig? New-request notifications will stop posting here.'))
        return
      setUnbinding(bindingId)
      try {
        const res = await fetch(`/api/slack/channel-bindings/${encodeURIComponent(bindingId)}`, {
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
            <h1 className='font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl'>Slack</h1>
            <p className='mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground'>
              Get a message in Slack whenever a request is proposed on one of your multisigs, and again when it has
              enough signatures to execute. Each message links straight to the request so signers can act in one
              click.
            </p>
          </div>

          {/* Overview for first-time visitors. Once a workspace is installed,
              the bind guide below takes over, so this would only repeat it. */}
          {!hasWorkspaces && (
          <ol className='grid gap-3 md:grid-cols-3'>
            {[
              {
                title: 'Add the app',
                body: (
                  <>
                    Sign in with your wallet and click <span className='font-semibold'>Add to Slack</span> below.
                    Approve the install for your workspace.
                  </>
                )
              },
              {
                title: 'Bind a channel',
                body: (
                  <>
                    In the channel that should get notifications, run{' '}
                    <span className='font-mono'>/bind &lt;chain&gt; &lt;multisig&gt;</span>. For a private channel,{' '}
                    <span className='font-mono'>/invite @MyMultiSig</span> first.
                  </>
                )
              },
              {
                title: 'Get notified',
                body: (
                  <>
                    New requests and ready-to-execute requests are posted there.{' '}
                    <span className='font-mono'>/unbind</span> stops them; <span className='font-mono'>/multisig help</span>{' '}
                    lists every command.
                  </>
                )
              }
            ].map((step, i) => (
              <li key={step.title} className='flex flex-col gap-1 rounded-lg border border-border p-4'>
                <span className='font-mono text-xs text-primary'>STEP {i + 1}</span>
                <span className='text-sm font-semibold text-foreground'>{step.title}</span>
                <span className='text-xs leading-relaxed text-muted-foreground'>{step.body}</span>
              </li>
            ))}
          </ol>
          )}

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

          {justInstalled && status.kind === 'ready' && status.workspaces.length > 0 && (
            <div className='flex items-start gap-2 rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm text-foreground'>
              <CheckCircleIcon className='mt-0.5 h-4 w-4 shrink-0 text-primary' />
              <span>
                {status.bindings.length === 0 ? (
                  <>
                    MyMultiSig is in your Slack workspace. One more step: bind a channel so notifications have somewhere
                    to go.{' '}
                    <a href='#bind-a-channel' className='font-semibold text-primary underline-offset-4 hover:underline'>
                      Show me how
                    </a>
                  </>
                ) : (
                  'MyMultiSig is in your Slack workspace and your channels are bound.'
                )}
              </span>
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
                  Add to Slack
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
                    <span className='break-all text-xs text-muted-foreground'>
                      Installed {formatDate(w.installedAt)} · scope: <span className='font-mono'>{w.scope}</span>
                    </span>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    <Button variant='outline' asChild className='gap-2'>
                      <a href={slackWorkspaceUrl(w.teamId)} target='_blank' rel='noreferrer'>
                        <ExternalLinkIcon className='h-4 w-4' />
                        Open in Slack
                      </a>
                    </Button>
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
                </div>
              ))}

              {status.workspaces.length > 0 && (
                <div id='bind-a-channel' className='mt-2 flex flex-col gap-2'>
                  <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4'>
                    <div className='flex flex-col gap-1'>
                      <span className='text-sm font-semibold text-foreground'>Channel bindings</span>
                      <span className='text-xs text-muted-foreground'>
                        {status.bindings.length === 0
                          ? 'No channel is bound yet, so notifications have nowhere to go. Follow the steps below.'
                          : 'Channels that receive notifications for the multisigs bound to them.'}
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
                          {b.channelName != null ? `#${b.channelName}` : b.channelId}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {multiSigLabel(b.multisigAddress, b.chainId)} on {chainLabel(b.chainId)}
                          {status.workspaces.length > 1 && ` · ${teamName(b.teamId)}`}
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

                  {status.bindings.length === 0 ? (
                    <div className='rounded-lg border border-primary/40 p-4'>
                      <SlackBindGuide
                        workspaces={status.workspaces}
                        multiSigs={bindable}
                        onRefresh={() => void refresh()}
                        refreshing={refreshing}
                      />
                    </div>
                  ) : (
                    <details className='group rounded-lg border border-border p-4'>
                      <summary className='cursor-pointer text-sm font-semibold text-foreground'>
                        Bind another channel or multisig
                      </summary>
                      <div className='mt-4'>
                        <SlackBindGuide
                          workspaces={status.workspaces}
                          multiSigs={bindable}
                          onRefresh={() => void refresh()}
                          refreshing={refreshing}
                        />
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          )}

          <div className='rounded-lg border border-dashed border-border p-4 text-xs leading-relaxed text-muted-foreground'>
            <p>
              The bot never holds keys: it only posts notifications and links. Proposing and signing always happen in
              your own wallet in the app. This page lists the workspaces you added while signed in with this wallet,
              and every channel bound in them, including bindings teammates made with{' '}
              <span className='font-mono'>/bind</span>.
            </p>
          </div>
        </div>
      </BigCard>
    </div>
  )
}

export default SlackSettings