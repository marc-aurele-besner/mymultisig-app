import React, { useEffect, useRef } from 'react'
import { Button } from '../ui/button'
import { RefreshIcon } from '../icons/ChakraIcons'
import type { MessageKey } from '../../lib/app-version/policy'

interface UpdatingOverlayProps {
  message: MessageKey | null
  // True when an automatic reload was blocked by the loop guard: show a manual button only.
  stuck: boolean
  onReload: () => void
}

const REASON_COPY: Record<MessageKey, string> = {
  security: 'This update includes security fixes.',
  fix: 'This update fixes a bug you may have hit.',
  breaking: 'This update changed how the app talks to the server.'
}

// "Force" step: the page cannot keep running an old build. Covers the whole
// screen and takes focus, so nothing underneath can be used until the reload.
const UpdatingOverlay: React.FC<UpdatingOverlayProps> = ({ message, stuck, onReload }) => {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const reason = message ? ` ${REASON_COPY[message]}` : ''
  const body = stuck
    ? 'The new version is ready. Reload to continue.'
    : `A new version just went live. Reloading to pick it up.${reason}`

  return (
    <div
      role='alertdialog'
      aria-modal='true'
      aria-labelledby='app-update-title'
      aria-describedby='app-update-body'
      className='bg-background fixed inset-0 z-[100] flex items-center justify-center px-4'
    >
      <div className='flex max-w-md flex-col items-center gap-4 text-center'>
        {!stuck && <RefreshIcon className='text-primary h-6 w-6 animate-spin' aria-hidden />}
        <h1 id='app-update-title' ref={headingRef} tabIndex={-1} className='text-2xl font-semibold outline-none'>
          {stuck ? 'Almost there' : 'Updating MyMultiSig'}
        </h1>
        <p id='app-update-body' className='text-muted-foreground'>
          {body}
        </p>
        <Button onClick={onReload}>Reload now</Button>
      </div>
    </div>
  )
}

export default UpdatingOverlay
