import React, { useEffect, useState } from 'react'

import { useAppVersion } from '../../hooks/useAppVersion'
import { reloadApp } from '../../lib/app-version/reload'
import UpdateBanner from './UpdateBanner'
import UpdatingOverlay from './UpdatingOverlay'

// "Later" hides the banner for this long. Only the staleness rules force an update.
const SNOOZE_MS = 30 * 60 * 1000
// Short pause before a forced reload so the visitor sees why the page changed.
const FORCE_DELAY_MS = 3000

// Mounted once in _app. Renders nothing while the tab is current.
const AppUpdate: React.FC = () => {
  const { state, info } = useAppVersion()
  const [snoozedUntil, setSnoozedUntil] = useState<number | null>(null)
  const [stuck, setStuck] = useState(false)

  const forced = state.kind === 'required'

  useEffect(() => {
    if (!forced) return
    const timer = window.setTimeout(() => {
      // The loop guard can refuse an automatic reload; then show the manual state.
      if (!reloadApp('forced')) setStuck(true)
    }, FORCE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [forced])

  useEffect(() => {
    if (snoozedUntil === null) return
    const timer = window.setTimeout(() => setSnoozedUntil(null), Math.max(snoozedUntil - Date.now(), 0))
    return () => window.clearTimeout(timer)
  }, [snoozedUntil])

  if (forced) {
    return <UpdatingOverlay message={info?.message ?? null} stuck={stuck} onReload={() => void reloadApp('manual')} />
  }

  if (state.kind === 'available' && snoozedUntil === null) {
    return (
      <UpdateBanner
        onRefresh={() => void reloadApp('manual')}
        onLater={() => setSnoozedUntil(Date.now() + SNOOZE_MS)}
      />
    )
  }

  return null
}

export default AppUpdate
