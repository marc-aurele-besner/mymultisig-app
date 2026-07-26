import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

import useCancelMultiSigRequest from '../../hooks/useCancelMultiSigRequest'

interface CancelRequestButtonProps {
  multiSigRequestId: string
  existingRequestId: string
  // Description shown in the confirmation dialog so the owner knows what
  // they're cancelling. Optional — falls back to generic copy.
  description?: string
}

// Owner-initiated cancel. Wraps the new /api/multisig-requests/[id]/cancel
// endpoint in a Radix confirmation dialog so the action is explicit
// (unlike Delete, which clicks through immediately).
//
// The server enforces owner-only via withVerifiedAsOwner; the UI mirrors
// that by hiding the button entirely when the connected wallet isn't on
// the owners list (the parent decides via isOwner).

const CancelRequestButton: React.FC<CancelRequestButtonProps> = ({
  multiSigRequestId,
  existingRequestId,
  description
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [open, setOpen] = useState(false)
  const isCancelled = useCancelMultiSigRequest(multiSigRequestId, existingRequestId, isConfirmed)

  if (isCancelled) {
    return (
      <span className='px-2 pt-2 text-lg font-bold text-muted-foreground'>This request has been cancelled.</span>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='mx-2 mt-2'>
          Cancel request
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this request?</DialogTitle>
          <DialogDescription>
            Cancelling marks the request inactive and wipes the signatures on every other request in the
            queue with a higher nonce, so the team re-confirms.
            {description != null && description !== '' ? (
              <>
                <br />
                <br />
                Request: <span className='font-mono text-foreground'>{description}</span>
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Keep request
          </Button>
          <Button
            variant='destructive'
            onClick={() => {
              setIsConfirmed(true)
              setOpen(false)
            }}
          >
            Cancel request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CancelRequestButton