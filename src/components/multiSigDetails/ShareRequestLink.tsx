import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckIcon, CopyIcon } from '../icons/ChakraIcons'

interface ShareRequestLinkProps {
  requestId: string
}

// Full link to a request, for pasting to the other owners. The origin is read
// after mount so the link matches the deployment the owner is actually using.
const ShareRequestLink: React.FC<ShareRequestLinkProps> = ({ requestId }) => {
  const [url, setUrl] = useState(`/request/${encodeURIComponent(requestId)}`)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setUrl(`${window.location.origin}/request/${encodeURIComponent(requestId)}`)
  }, [requestId])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access denied; the field stays selectable for manual copy.
    }
  }

  return (
    <div className='flex w-full flex-wrap items-center gap-2 px-6'>
      <span className='text-sm font-semibold text-foreground'>Share link</span>
      <Input
        readOnly
        value={url}
        aria-label='Request link'
        onFocus={(e) => e.currentTarget.select()}
        className='min-w-0 flex-1 font-mono text-xs'
      />
      <Button variant='outline' onClick={handleCopy} aria-label='Copy request link'>
        {copied ? <CheckIcon className='h-4 w-4 animate-pop-in text-primary' /> : <CopyIcon className='h-4 w-4' />}
        {copied ? 'Copied' : 'Copy link'}
      </Button>
    </div>
  )
}

export default ShareRequestLink
