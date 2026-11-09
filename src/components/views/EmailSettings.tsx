import React, { useCallback, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import BigCard from '../cards/BigCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckIcon, WarningIcon } from '../icons/ChakraIcons'

export interface EmailSubscription {
  email: string
  verified: boolean
}

interface EmailStatusResponse {
  isOwner: boolean
  subscription: EmailSubscription | null
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'signedOut' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; data: EmailStatusResponse }

// Outcome banners set by the confirm and unsubscribe redirects
// (?email=confirmed | unsubscribed | invalid).
const bannerForParam = (value: string | null): { tone: 'success' | 'error'; text: string } | null => {
  switch (value) {
    case 'confirmed':
      return { tone: 'success', text: 'Email confirmed. You will now receive request notifications at this address.' }
    case 'unsubscribed':
      return {
        tone: 'success',
        text: 'You have been unsubscribed. No more email notifications will be sent to this address.'
      }
    case 'invalid':
      return {
        tone: 'error',
        text: 'This link is invalid or has expired. Enter your address again to get a new confirmation link.'
      }
    default:
      return null
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const readErrorMessage = async (res: Response): Promise<string> => {
  try {
    const body = (await res.json()) as { message?: string }
    if (typeof body.message === 'string') return body.message
  } catch {
    // Non-JSON error body; fall through to the status text.
  }
  return `Request failed (${res.status})`
}

const EmailSettings: React.FC = () => {
  const { isConnected, address } = useAccount()
  const [state, setState] = useState<LoadState>({ kind: 'loading' })
  const [banner, setBanner] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!isConnected) {
      setState({ kind: 'signedOut' })
      return
    }
    setState({ kind: 'loading' })
    try {
      const res = await fetch('/api/email/subscription', { credentials: 'include' })
      if (!res.ok) {
        setState({ kind: 'error', message: await readErrorMessage(res) })
        return
      }
      const body = (await res.json()) as { content: EmailStatusResponse }
      setState({ kind: 'ready', data: body.content })
      if (body.content.subscription != null) setEmail(body.content.subscription.email)
    } catch (e) {
      setState({ kind: 'error', message: (e as Error).message })
    }
  }, [isConnected])

  useEffect(() => {
    void load()
  }, [load])

  // Read the outcome param once after a confirm/unsubscribe redirect, then
  // strip it so a refresh does not show the banner again.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    const param = url.searchParams.get('email')
    if (param == null) return
    setBanner(bannerForParam(param))
    url.searchParams.delete('email')
    window.history.replaceState({}, '', url.toString())
  }, [])

  const onSave = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const trimmed = email.trim()
      if (!EMAIL_REGEX.test(trimmed)) {
        setFormError('Enter a valid email address.')
        return
      }
      setFormError(null)
      setSaving(true)
      try {
        const res = await fetch('/api/email/subscription', {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmed })
        })
        if (!res.ok) {
          setFormError(await readErrorMessage(res))
          return
        }
        setSentTo(trimmed)
        await load()
      } catch (e) {
        setFormError((e as Error).message)
      } finally {
        setSaving(false)
      }
    },
    [email, load]
  )

  const onRemove = useCallback(async () => {
    if (!window.confirm('Stop email notifications for this wallet?')) return
    setRemoving(true)
    try {
      const res = await fetch('/api/email/subscription', { method: 'DELETE', credentials: 'include' })
      if (!res.ok) {
        setFormError(await readErrorMessage(res))
        return
      }
      setSentTo(null)
      setEmail('')
      await load()
    } catch (e) {
      setFormError((e as Error).message)
    } finally {
      setRemoving(false)
    }
  }, [load])

  return (
    <div className='flex justify-center'>
      <BigCard className='max-w-[1000px]'>
        <div className='flex w-full flex-col gap-6'>
          <div>
            <p className='mb-3 font-mono text-xs tracking-[0.2em] text-primary'>SETTINGS</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl'>Email</h1>
            <p className='mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground'>
              Get an email when a request on a multisig you own needs your signature, and again when it reaches its
              threshold and is ready to execute. Each address is confirmed with a link first, and every email has an
              unsubscribe link.
            </p>
          </div>

          {banner != null && (
            <div
              role='status'
              className={
                banner.tone === 'success'
                  ? 'flex items-start gap-2 rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm text-foreground'
                  : 'flex items-start gap-2 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive'
              }
            >
              {banner.tone === 'success' ? (
                <CheckIcon className='mt-0.5 h-4 w-4 shrink-0' />
              ) : (
                <WarningIcon className='mt-0.5 h-4 w-4 shrink-0' />
              )}
              <span>{banner.text}</span>
            </div>
          )}

          {state.kind === 'loading' && <p className='text-sm text-muted-foreground'>Loading email settings…</p>}

          {state.kind === 'signedOut' && (
            <div className='rounded-lg border border-border p-4 text-sm text-muted-foreground'>
              Connect and sign in with the wallet that owns a multisig to set up email notifications for it.
            </div>
          )}

          {state.kind === 'error' && (
            <div className='flex items-start gap-2 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive'>
              <WarningIcon className='mt-0.5 h-4 w-4 shrink-0' />
              <span>{state.message}</span>
            </div>
          )}

          {state.kind === 'ready' && !state.data.isOwner && (
            <div className='rounded-lg border border-border p-4 text-sm text-muted-foreground'>
              {address != null && `${address.slice(0, 6)}…${address.slice(-4)} `}is not an owner of any multisig on
              MyMultiSig. Email notifications are only available to owners.
            </div>
          )}

          {state.kind === 'ready' && state.data.isOwner && (
            <div className='flex flex-col gap-4 rounded-lg border border-border p-4'>
              {state.data.subscription != null && !state.data.subscription.verified && (
                <p className='text-sm text-muted-foreground'>
                  Confirmation pending for{' '}
                  <span className='font-mono text-foreground'>{state.data.subscription.email}</span>. Click the link in
                  that email to start receiving notifications. Nothing is sent until you confirm.
                </p>
              )}
              {state.data.subscription != null && state.data.subscription.verified && (
                <p className='text-sm text-muted-foreground'>
                  Notifications go to <span className='font-mono text-foreground'>{state.data.subscription.email}</span>
                  .
                </p>
              )}
              {sentTo != null && (
                <p className='text-sm text-muted-foreground'>
                  Confirmation sent to <span className='font-mono text-foreground'>{sentTo}</span>.
                </p>
              )}

              <form className='flex flex-col gap-3 sm:flex-row sm:items-end' onSubmit={onSave} noValidate>
                <div className='flex w-full flex-col gap-2'>
                  <Label htmlFor='email-notification-address'>Email address</Label>
                  <Input
                    id='email-notification-address'
                    type='email'
                    autoComplete='email'
                    placeholder='you@example.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type='submit' disabled={saving || email.trim().length === 0}>
                  {saving ? 'Sending…' : state.data.subscription?.verified ? 'Change address' : 'Send confirmation'}
                </Button>
              </form>

              {formError != null && (
                <div className='flex items-start gap-2 text-sm text-destructive'>
                  <WarningIcon className='mt-0.5 h-4 w-4 shrink-0' />
                  <span>{formError}</span>
                </div>
              )}

              {state.data.subscription != null && (
                <div>
                  <Button variant='outline' onClick={onRemove} disabled={removing}>
                    {removing ? 'Removing…' : 'Turn off email notifications'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </BigCard>
    </div>
  )
}

export default EmailSettings
