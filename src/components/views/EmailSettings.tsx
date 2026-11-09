import React, { useCallback, useEffect, useState } from 'react'
import { useAccount, useChainId, useSignMessage } from 'wagmi'

import BigCard from '../cards/BigCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { CheckIcon, WarningIcon } from '../icons/ChakraIcons'
import { ensureSiweSession } from '../../utils/siwe'
import { cn } from '@/lib/utils'

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
  | { kind: 'disconnected' }
  | { kind: 'needsSignIn' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; data: EmailStatusResponse }

type Banner = { tone: 'success' | 'error'; text: string }

// Outcome banners set by the confirm and unsubscribe redirects
// (?email=confirmed | unsubscribed | invalid).
const bannerForParam = (value: string | null): Banner | null => {
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

const shortenAddress = (address: string): string => `${address.slice(0, 6)}…${address.slice(-4)}`

const readErrorMessage = async (res: Response): Promise<string> => {
  try {
    const body = (await res.json()) as { message?: string }
    if (typeof body.message === 'string') return body.message
  } catch {
    // Non-JSON error body; fall through to the status text.
  }
  return `Request failed (${res.status})`
}

const steps: { title: string; body: React.ReactNode }[] = [
  {
    title: 'Sign in',
    body: 'Connect the wallet that owns your multisig and sign the free sign-in message. No transaction is sent.'
  },
  {
    title: 'Add your inbox',
    body: 'Enter the address that should get notifications. We email it a confirmation link.'
  },
  {
    title: 'Confirm',
    body: 'Click the link in that email. Nothing is sent to the address until you do.'
  }
]

const notificationTypes: { subject: string; body: string }[] = [
  {
    subject: 'Signature needed',
    body: 'A request on one of your multisigs is waiting for your signature. Not sent if you proposed it or already signed.'
  },
  {
    subject: 'Ready to execute',
    body: 'A request reached its signing threshold and can be executed. Sent to every confirmed owner.'
  }
]

const StatusPill: React.FC<{ subscription: EmailSubscription | null }> = ({ subscription }) => {
  const [label, className] =
    subscription == null
      ? ['off', 'border-border bg-muted text-muted-foreground']
      : subscription.verified
        ? ['active', 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300']
        : ['pending confirmation', 'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300']
  return (
    <span className={cn('rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider', className)}>
      {label}
    </span>
  )
}

const BannerBox: React.FC<{ banner: Banner }> = ({ banner }) => (
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
)

const EmailSettings: React.FC = () => {
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  const { signMessageAsync } = useSignMessage()
  const [state, setState] = useState<LoadState>({ kind: 'loading' })
  const [banner, setBanner] = useState<Banner | null>(null)
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [resending, setResending] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!isConnected || address == null) {
      setState({ kind: 'disconnected' })
      return
    }
    setState({ kind: 'loading' })
    try {
      const res = await fetch('/api/email/subscription', { credentials: 'include' })
      // 401 means no SIWE session for this wallet yet (e.g. the global
      // sign-in prompt was declined, or is still pending on first load).
      if (res.status === 401) {
        setState({ kind: 'needsSignIn' })
        return
      }
      if (!res.ok) {
        setState({ kind: 'error', message: await readErrorMessage(res) })
        return
      }
      const body = (await res.json()) as { content: EmailStatusResponse }
      setState({ kind: 'ready', data: body.content })
      setEmail(body.content.subscription?.email ?? '')
    } catch (e) {
      setState({ kind: 'error', message: (e as Error).message })
    }
  }, [isConnected, address])

  // Reload (and drop any half-typed input) whenever the wallet changes, since
  // the inbox belongs to the signed-in wallet.
  useEffect(() => {
    setFormError(null)
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

  const onSignIn = useCallback(async () => {
    if (address == null) return
    setSigningIn(true)
    try {
      const ok = await ensureSiweSession(address, chainId, signMessageAsync)
      if (ok) await load()
      else setBanner({ tone: 'error', text: 'Sign-in was cancelled. Sign the message in your wallet to continue.' })
    } finally {
      setSigningIn(false)
    }
  }, [address, chainId, signMessageAsync, load])

  const putEmail = useCallback(async (value: string): Promise<boolean> => {
    setFormError(null)
    const res = await fetch('/api/email/subscription', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: value })
    })
    if (!res.ok) {
      setFormError(await readErrorMessage(res))
      return false
    }
    return true
  }, [])

  const onSave = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const trimmed = email.trim()
      if (!EMAIL_REGEX.test(trimmed)) {
        setFormError('Enter a valid email address.')
        return
      }
      setSaving(true)
      try {
        if (await putEmail(trimmed)) {
          setBanner({
            tone: 'success',
            text: `Confirmation link sent to ${trimmed}. Click it to start receiving notifications.`
          })
          await load()
        }
      } catch (e) {
        setFormError((e as Error).message)
      } finally {
        setSaving(false)
      }
    },
    [email, load, putEmail]
  )

  const onResend = useCallback(
    async (pending: string) => {
      setResending(true)
      try {
        if (await putEmail(pending)) {
          setBanner({ tone: 'success', text: `A new confirmation link was sent to ${pending}.` })
        }
      } catch (e) {
        setFormError((e as Error).message)
      } finally {
        setResending(false)
      }
    },
    [putEmail]
  )

  const onRemove = useCallback(async () => {
    setRemoving(true)
    setFormError(null)
    try {
      const res = await fetch('/api/email/subscription', { method: 'DELETE', credentials: 'include' })
      if (!res.ok) {
        setFormError(await readErrorMessage(res))
        return
      }
      setRemoveOpen(false)
      setBanner({ tone: 'success', text: 'Email notifications turned off for this wallet.' })
      await load()
    } catch (e) {
      setFormError((e as Error).message)
    } finally {
      setRemoving(false)
    }
  }, [load])

  const subscription = state.kind === 'ready' ? state.data.subscription : null
  const trimmedEmail = email.trim()
  const unchanged = subscription != null && trimmedEmail.toLowerCase() === subscription.email.toLowerCase()

  return (
    <div className='flex justify-center'>
      <BigCard className='max-w-[1000px]'>
        <div className='flex w-full flex-col gap-6'>
          <div>
            <p className='mb-3 font-mono text-xs tracking-[0.2em] text-primary'>SETTINGS</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl'>Email</h1>
            <p className='mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground'>
              Get an email when a request on a multisig you own needs your signature, and again when it is ready to
              execute. No bot to install. Each email links straight to the request.
            </p>
          </div>

          <ol className='grid gap-3 md:grid-cols-3'>
            {steps.map((step, i) => (
              <li key={step.title} className='flex flex-col gap-1 rounded-lg border border-border p-4'>
                <span className='font-mono text-xs text-primary'>STEP {i + 1}</span>
                <span className='text-sm font-semibold text-foreground'>{step.title}</span>
                <span className='text-xs leading-relaxed text-muted-foreground'>{step.body}</span>
              </li>
            ))}
          </ol>

          {banner != null && <BannerBox banner={banner} />}

          {state.kind === 'loading' && <p className='text-sm text-muted-foreground'>Loading email settings…</p>}

          {state.kind === 'disconnected' && (
            <div className='rounded-lg border border-border p-4 text-sm text-muted-foreground'>
              Connect the wallet that owns a multisig to set up email notifications for it.
            </div>
          )}

          {state.kind === 'needsSignIn' && (
            <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4'>
              <p className='text-sm text-muted-foreground'>
                Sign in with {address != null ? shortenAddress(address) : 'your wallet'} to manage its email
                notifications. Signing is free and sends no transaction.
              </p>
              <Button onClick={onSignIn} disabled={signingIn}>
                {signingIn ? 'Check your wallet…' : 'Sign in'}
              </Button>
            </div>
          )}

          {state.kind === 'error' && (
            <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive'>
              <span className='flex items-start gap-2'>
                <WarningIcon className='mt-0.5 h-4 w-4 shrink-0' />
                {state.message}
              </span>
              <Button variant='outline' onClick={() => void load()}>
                Try again
              </Button>
            </div>
          )}

          {state.kind === 'ready' && !state.data.isOwner && (
            <div className='rounded-lg border border-border p-4 text-sm text-muted-foreground'>
              {address != null && `${shortenAddress(address)} `}is not an owner of any multisig on MyMultiSig. Email
              notifications are only available to owners. Switch to an owner wallet, or create or import a multisig
              first.
            </div>
          )}

          {state.kind === 'ready' && state.data.isOwner && (
            <div className='flex flex-col gap-4 rounded-lg border border-border p-4'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <div className='flex flex-col gap-0.5'>
                  <span className='text-sm font-semibold text-foreground'>Notification inbox</span>
                  {address != null && (
                    <span className='text-xs text-muted-foreground'>For wallet {shortenAddress(address)}</span>
                  )}
                </div>
                <StatusPill subscription={subscription} />
              </div>

              {subscription != null && !subscription.verified && (
                <div className='flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-3'>
                  <p className='text-sm text-muted-foreground'>
                    Waiting for you to confirm <span className='font-mono text-foreground'>{subscription.email}</span>.
                    Check your inbox (and spam folder) for the link.
                  </p>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => void onResend(subscription.email)}
                    disabled={resending}
                  >
                    {resending ? 'Sending…' : 'Resend link'}
                  </Button>
                </div>
              )}

              {subscription != null && subscription.verified && (
                <p className='text-sm text-muted-foreground'>
                  Notifications go to <span className='font-mono text-foreground'>{subscription.email}</span>.
                </p>
              )}

              <form className='flex flex-col gap-3 sm:flex-row sm:items-end' onSubmit={onSave} noValidate>
                <div className='flex w-full flex-col gap-2'>
                  <Label htmlFor='email-notification-address'>
                    {subscription == null ? 'Email address' : 'Change address'}
                  </Label>
                  <Input
                    id='email-notification-address'
                    type='email'
                    inputMode='email'
                    autoComplete='email'
                    placeholder='you@example.com'
                    value={email}
                    aria-invalid={formError != null}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (formError != null) setFormError(null)
                    }}
                  />
                </div>
                <Button type='submit' disabled={saving || trimmedEmail.length === 0 || unchanged}>
                  {saving ? 'Sending…' : subscription == null ? 'Send confirmation' : 'Save new address'}
                </Button>
              </form>
              {subscription != null && !unchanged && trimmedEmail.length > 0 && (
                <p className='-mt-2 text-xs text-muted-foreground'>
                  Saving a new address pauses notifications until you confirm it.
                </p>
              )}

              {formError != null && (
                <div className='flex items-start gap-2 text-sm text-destructive'>
                  <WarningIcon className='mt-0.5 h-4 w-4 shrink-0' />
                  <span>{formError}</span>
                </div>
              )}

              {subscription != null && (
                <div className='border-t border-border pt-4'>
                  <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
                    <DialogTrigger asChild>
                      <Button variant='outline'>Turn off email notifications</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Turn off email notifications?</DialogTitle>
                        <DialogDescription>
                          {subscription.email} will stop receiving emails for multisigs owned by this wallet. You can
                          add an address again at any time.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant='outline' onClick={() => setRemoveOpen(false)} disabled={removing}>
                          Keep notifications
                        </Button>
                        <Button variant='destructive' onClick={() => void onRemove()} disabled={removing}>
                          {removing ? 'Turning off…' : 'Turn off'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          )}

          <div className='flex flex-col gap-3'>
            <h2 className='text-sm font-semibold text-foreground'>What you will receive</h2>
            <div className='grid gap-3 md:grid-cols-2'>
              {notificationTypes.map((type) => (
                <div key={type.subject} className='flex flex-col gap-1 rounded-lg border border-border p-4'>
                  <span className='text-sm font-semibold text-foreground'>{type.subject}</span>
                  <span className='text-xs leading-relaxed text-muted-foreground'>{type.body}</span>
                </div>
              ))}
            </div>
          </div>

          <div className='rounded-lg border border-dashed border-border p-4 text-xs leading-relaxed text-muted-foreground'>
            <p>
              One inbox per wallet, covering every multisig that wallet owns. Your address is only used for these
              notifications and is never shown to other owners. Every email has an unsubscribe link that works without
              signing in.
            </p>
          </div>
        </div>
      </BigCard>
    </div>
  )
}

export default EmailSettings
