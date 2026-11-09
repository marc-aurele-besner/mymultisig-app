import { useCallback, useEffect, useRef, useState } from 'react'

import {
  ClientVersion,
  UpdateState,
  VersionInfo,
  escalateOnError,
  isStaleDeploymentMessage,
  updateState
} from '../lib/app-version/policy'

// Checks run after the page's own requests have settled, then once a minute
// while the tab is visible. Hidden tabs do not poll.
const FIRST_CHECK_DELAY_MS = 5000
const POLL_INTERVAL_MS = 60 * 1000
// Wake-up checks (focus, visible, online, error) are throttled to one per 15 s.
const WAKE_THROTTLE_MS = 15 * 1000

// Compared against the server answer. Empty or 0 in local dev, which disables detection.
const CLIENT: ClientVersion = {
  buildId: process.env.NEXT_PUBLIC_BUILD_ID || '',
  builtAt: Number(process.env.NEXT_PUBLIC_BUILT_AT) || 0
}
const ENABLED = process.env.NODE_ENV === 'production' && CLIENT.builtAt > 0

type Trigger = 'mount' | 'poll' | 'wake' | 'error'

function errorText(event: ErrorEvent | PromiseRejectionEvent): string {
  if ('message' in event && typeof event.message === 'string') return event.message
  const reason = (event as PromiseRejectionEvent).reason
  return reason instanceof Error ? reason.message : String(reason ?? '')
}

// Detects that the server runs a newer build than this tab. Returns the state
// and the server's info so the UI can show the message key.
export function useAppVersion(): { state: UpdateState; info: VersionInfo | null } {
  const [state, setState] = useState<UpdateState>({ kind: 'current' })
  const [info, setInfo] = useState<VersionInfo | null>(null)
  const lastCheckAt = useRef(0)

  const check = useCallback(async (trigger: Trigger) => {
    const now = Date.now()
    if (trigger !== 'mount' && now - lastCheckAt.current < WAKE_THROTTLE_MS) return
    lastCheckAt.current = now

    let server: VersionInfo
    try {
      const response = await fetch('/api/build-id', { cache: 'no-store' })
      if (!response.ok) return
      server = (await response.json()) as VersionInfo
    } catch {
      // Offline or a flaky network: no answer means no false positive.
      return
    }

    setInfo(server)
    setState((previous) => {
      const next = updateState(CLIENT, server, Date.now())
      const escalated = trigger === 'error' ? escalateOnError(next) : next
      // Once an update is required it stays required; a later check cannot downgrade it.
      if (previous.kind === 'required' && escalated.kind !== 'current') return previous
      return escalated
    })
  }, [])

  useEffect(() => {
    if (!ENABLED) return

    const firstCheck = window.setTimeout(() => void check('mount'), FIRST_CHECK_DELAY_MS)
    const poll = window.setInterval(() => {
      if (document.visibilityState === 'visible') void check('poll')
    }, POLL_INTERVAL_MS)

    const onWake = () => {
      if (document.visibilityState === 'visible') void check('wake')
    }
    const onOnline = () => void check('wake')
    const onError = (event: ErrorEvent | PromiseRejectionEvent) => {
      if (isStaleDeploymentMessage(errorText(event))) void check('error')
    }

    document.addEventListener('visibilitychange', onWake)
    window.addEventListener('focus', onWake)
    window.addEventListener('online', onOnline)
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onError)

    return () => {
      window.clearTimeout(firstCheck)
      window.clearInterval(poll)
      document.removeEventListener('visibilitychange', onWake)
      window.removeEventListener('focus', onWake)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onError)
    }
  }, [check])

  return { state, info }
}
