import React, { useEffect, useState } from 'react'

import useMultiSigs from '../../states/multiSigs'

// Thin top-of-list banner that surfaces the most recent cascade
// invalidation ("N downstream request(s) were cancelled because request X
// was executed / reset / cancelled"). Reads the transient `lastCascade`
// slot from the Zustand store; auto-dismisses after 60s.

const triggerCopy: Record<string, string> = {
  executed: 'executed',
  failed: 'failed',
  reset: 'reset',
  cancelled: 'cancelled by an owner'
}

const CascadeBanner: React.FC = () => {
  const lastCascade = useMultiSigs((s) => s.lastCascade)
  const setLastCascade = useMultiSigs((s) => s.setLastCascade)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (lastCascade == null) return
    const elapsed = Date.now() - new Date(lastCascade.at).getTime()
    if (elapsed >= 60_000) {
      setLastCascade(null)
      return
    }
    const remaining = 60_000 - elapsed
    const handle = setTimeout(() => setLastCascade(null), remaining)
    // tick so the countdown refreshes if a new cascade lands
    setNow(Date.now())
    return () => clearTimeout(handle)
  }, [lastCascade, setLastCascade])

  if (lastCascade == null) return null
  if (lastCascade.cancelledIds.length === 0) return null
  const verb = triggerCopy[lastCascade.trigger] ?? lastCascade.trigger
  const noun = lastCascade.cancelledIds.length === 1 ? 'request was' : 'requests were'
  return (
    <div className='flex w-full flex-col gap-1 rounded-lg border border-border bg-muted/40 p-3 text-sm text-foreground'>
      <span>
        {lastCascade.cancelledIds.length} downstream {noun} cancelled because the source request was {verb}.
        Signatures were wiped; collect them again with the next nonce.
      </span>
      <button
        type='button'
        className='self-end text-xs text-muted-foreground underline hover:text-foreground'
        onClick={() => setLastCascade(null)}
      >
        Dismiss
      </button>
    </div>
  )
}

export default CascadeBanner