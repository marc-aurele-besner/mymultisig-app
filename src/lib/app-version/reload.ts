import { canAutoReload } from './policy'

const RELOADED_AT_KEY = 'app-update:reloaded-at'

// "manual" is a click on the banner or the overlay: always allowed.
// "forced" is automatic: skipped when a reload just happened (loop guard).
// Returns false when an automatic reload was blocked.
export function reloadApp(trigger: 'manual' | 'forced'): boolean {
  let last: number | null = null
  try {
    const raw = window.sessionStorage.getItem(RELOADED_AT_KEY)
    last = raw === null ? null : Number(raw)
  } catch {
    // Storage can be blocked; fall through without the guard data.
  }

  if (trigger === 'forced' && !canAutoReload(last, Date.now())) return false

  try {
    window.sessionStorage.setItem(RELOADED_AT_KEY, String(Date.now()))
  } catch {
    // Without storage the guard is simply off.
  }
  window.location.reload()
  return true
}
