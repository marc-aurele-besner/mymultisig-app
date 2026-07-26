import React, { useCallback, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import BigCard from '../cards/BigCard'
import { Button } from '@/components/ui/button'
import { TelegramChatConfig, TelegramInstallation } from '../../models/Telegram'
import { CheckIcon, DeleteIcon, ExternalLinkIcon, WarningIcon } from '../icons/ChakraIcons'

type Status =
  | { kind: 'loading' }
  | { kind: 'signedOut' }
  | { kind: 'ready'; installations: TelegramInstallation[]; bindings: TelegramChatConfig[] }
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

const TelegramSettings: React.FC = () => {
  const { isConnected, address } = useAccount()
  const [status, setStatus] = useState<Status>({ kind: 'loading' })
  const [uninstalling, setUninstalling] = useState<string | null>(null)
  const [unbinding, setUnbinding] = useState<string | null>(null)
  const [installToken, setInstallToken] = useState('')
  const [installing, setInstalling] = useState(false)
  const [installError, setInstallError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!isConnected) {
      setStatus({ kind: 'signedOut' })
      return
    }
    setStatus({ kind: 'loading' })
    try {
      const [instRes, bindRes] = await Promise.all([
        fetch('/api/telegram/installations', { credentials: 'include' }),
        fetch('/api/telegram/chat-bindings', { credentials: 'include' })
      ])
      if (!instRes.ok) {
        const text = await instRes.text()
        setStatus({ kind: 'error', message: `Failed to load installations (${instRes.status}): ${text}` })
        return
      }
      const instBody = (await instRes.json()) as { installations: TelegramInstallation[] }
      const bindings = bindRes.ok ? ((await bindRes.json()) as { bindings: TelegramChatConfig[] }).bindings : []
      setStatus({ kind: 'ready', installations: instBody.installations, bindings })
    } catch (e) {
      setStatus({ kind: 'error', message: (e as Error).message })
    }
  }, [isConnected])

  useEffect(() => {
    void load()
  }, [load])

  const onInstall = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (installing) return
      const trimmed = installToken.trim()
      if (trimmed === '') {
        setInstallError('Paste a bot token first.')
        return
      }
      setInstalling(true)
      setInstallError(null)
      try {
        const res = await fetch('/api/telegram/installations', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: trimmed })
        })
        if (!res.ok) {
          const text = await res.text()
          let message = `Install failed (${res.status})`
          try {
            const parsed = JSON.parse(text) as { error?: string }
            if (typeof parsed.error === 'string') message = parsed.error
          } catch {
            if (text) message = `${message}: ${text}`
          }
          setInstallError(message)
          return
        }
        setInstallToken('')
        await load()
      } catch (err) {
        setInstallError((err as Error).message)
      } finally {
        setInstalling(false)
      }
    },
    [installToken, installing, load]
  )

  const onUninstall = useCallback(
    async (id: string) => {
      if (!window.confirm('Uninstall this Telegram bot? The bot will stop responding in Telegram.')) return
      setUninstalling(id)
      try {
        const res = await fetch(`/api/telegram/installations/${encodeURIComponent(id)}`, {
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
      if (!window.confirm('Unbind this chat from the multisig? New-request notifications will stop posting here.'))
        return
      setUnbinding(bindingId)
      try {
        const res = await fetch(`/api/telegram/chat-bindings/${encodeURIComponent(bindingId)}`, {
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
            <h1 className='font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl'>Telegram</h1>
            <p className='mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground'>
              Bring slash commands to any Telegram chat where your bot is a member. Create a bot with{' '}
              <span className='font-mono'>@BotFather</span>, paste the token below, and the app registers the webhook
              and slash commands for you.
            </p>
          </div>

          {status.kind === 'loading' && <p className='text-sm text-muted-foreground'>Loading installed bots…</p>}

          {status.kind === 'signedOut' && (
            <div className='rounded-lg border border-border p-4 text-sm text-muted-foreground'>
              Sign in with your wallet to view the Telegram bots linked to it. The list is filtered to the wallet that
              registered each bot.
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
              <form
                onSubmit={(e) => void onInstall(e)}
                className='flex flex-col gap-3 rounded-lg border border-border p-4'
              >
                <div className='flex flex-col gap-1'>
                  <span className='text-sm font-semibold text-foreground'>Register a bot</span>
                  <span className='text-xs text-muted-foreground'>
                    Open <span className='font-mono'>@BotFather</span>, send{' '}
                    <span className='font-mono'>/newbot</span>, and paste the token here. The token never leaves your
                    server-side encryption — only your wallet sees it in this list.
                  </span>
                </div>
                <div className='flex flex-col gap-2 sm:flex-row'>
                  <input
                    type='text'
                    inputMode='text'
                    autoComplete='off'
                    spellCheck={false}
                    value={installToken}
                    onChange={(e) => setInstallToken(e.target.value)}
                    placeholder='123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11'
                    className='flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                    disabled={installing}
                  />
                  <Button type='submit' disabled={installing || installToken.trim() === ''} className='gap-2'>
                    <ExternalLinkIcon className='h-4 w-4' />
                    {installing ? 'Installing…' : 'Install'}
                  </Button>
                </div>
                {installError != null && (
                  <div className='flex items-start gap-2 rounded-md border border-destructive bg-destructive/10 p-2 text-xs text-destructive'>
                    <WarningIcon className='mt-0.5 h-3 w-3 shrink-0' />
                    <span>{installError}</span>
                  </div>
                )}
              </form>

              <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4'>
                <div className='flex flex-col gap-1'>
                  <span className='text-sm font-semibold text-foreground'>
                    {status.installations.length === 0
                      ? 'No bots registered'
                      : `${status.installations.length} bot${status.installations.length === 1 ? '' : 's'} registered`}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {address != null && `Linked to wallet ${address.slice(0, 6)}…${address.slice(-4)}`}
                  </span>
                </div>
              </div>

              {status.installations.map((inst) => (
                <div
                  key={inst.id}
                  className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4'
                >
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      <a
                        href={`https://t.me/${inst.botUsername}`}
                        target='_blank'
                        rel='noreferrer'
                        className='text-sm font-semibold text-foreground hover:underline'
                      >
                        @{inst.botUsername}
                      </a>
                      {inst.hasToken && (
                        <span className='inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary'>
                          <CheckIcon className='h-3 w-3' /> installed
                        </span>
                      )}
                      {!inst.isActive && (
                        <span className='inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground'>
                          inactive
                        </span>
                      )}
                    </div>
                    <span className='font-mono text-xs text-muted-foreground'>bot id: {inst.botId}</span>
                    <span className='text-xs text-muted-foreground'>Installed {formatDate(inst.installedAt)}</span>
                  </div>
                  <Button
                    variant='outline'
                    onClick={() => void onUninstall(inst.id)}
                    disabled={uninstalling === inst.id}
                    className='gap-2'
                  >
                    <DeleteIcon className='h-4 w-4' />
                    {uninstalling === inst.id ? 'Uninstalling…' : 'Uninstall'}
                  </Button>
                </div>
              ))}

              <div className='mt-2 flex flex-col gap-2'>
                <div className='flex items-center justify-between gap-3 rounded-lg border border-border p-4'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-sm font-semibold text-foreground'>Chat bindings</span>
                    <span className='text-xs text-muted-foreground'>
                      Chats that will receive new-request notifications for the multisigs they&apos;re bound to.
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
                        {b.chatTitle != null ? b.chatTitle : 'chat'} <span className='font-mono text-xs text-muted-foreground'>({b.chatId})</span>
                      </span>
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
              Type <span className='font-mono'>/bind &lt;chain&gt; &lt;multisig&gt;</span> in any chat where the bot is
              present to receive new-request notifications there. <span className='font-mono'>/unbind</span> removes the
              binding.
            </p>
            <p className='mt-2'>
              <b>One bot at a time:</b> Telegram&apos;s webhook URL is global per bot, so registering a new bot
              auto-disables the previous one. Uninstall first if you want to keep the old bot intact.
            </p>
          </div>
        </div>
      </BigCard>
    </div>
  )
}

export default TelegramSettings
