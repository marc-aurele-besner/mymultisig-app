import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { WarningTwoIcon } from '../icons/ChakraIcons'

const Disclaimer: React.FC = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(true)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showClose={true}
        className="max-w-[600px] border-border bg-card/98 shadow-2xl backdrop-blur-xl"
      >
        <DialogHeader className="pb-2 pt-6">
          <DialogTitle className="flex items-center gap-3">
            <span className="rounded-lg bg-orange-500/20 p-2">
              <WarningTwoIcon className="h-5 w-5 text-orange-400" />
            </span>
            <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-xl font-bold text-transparent">
              Important Disclaimer
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm leading-relaxed text-foreground">
            Welcome to MyMultiSig. Please note that this is a work in development and some
            features may be incomplete or not functioning as intended. By using this app, you
            acknowledge and accept that:
          </p>

          <ul className="flex list-none flex-col gap-3 pl-4 text-sm leading-relaxed text-muted-foreground">
            <li>
              The app may contain bugs, errors, or other issues that could potentially affect
              your experience or data.
            </li>
            <li>
              We make no guarantees or warranties regarding the reliability, accuracy, or
              completeness of the app&apos;s features or content.
            </li>
            <li>
              You assume all risks associated with using the app, and we are not responsible for
              any damages, losses, or liabilities that may result from your use of the app.
            </li>
          </ul>

          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              We are continuously working to improve the app and fix any issues. If you
              encounter any problems or have suggestions, please feel free to contribute on
              GitHub.
            </p>
          </div>
        </div>

        <DialogFooter className="pb-6 pt-2">
          <Button className="w-full" size="lg" onClick={() => setOpen(false)}>
            I Understand & Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default Disclaimer
