import React from 'react'
import { Button } from '../ui/button'

interface UpdateBannerProps {
  onRefresh: () => void
  onLater: () => void
}

// "Ask" step: a new build is live and the visitor can choose when to reload.
// role=status with aria-live keeps it announced without stealing focus.
const UpdateBanner: React.FC<UpdateBannerProps> = ({ onRefresh, onLater }) => (
  <div
    role='status'
    aria-live='polite'
    className='bg-popover text-popover-foreground border-border fixed inset-x-4 bottom-4 z-50 flex flex-col gap-3 rounded-lg border p-4 shadow-lg md:inset-x-auto md:right-6 md:w-96'
  >
    <p className='text-sm'>A new version of MyMultiSig is available.</p>
    <div className='flex justify-end gap-2'>
      <Button variant='ghost' size='sm' onClick={onLater}>
        Later
      </Button>
      <Button size='sm' onClick={onRefresh}>
        Refresh
      </Button>
    </div>
  </div>
)

export default UpdateBanner
