import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { WarningTwoIcon } from '../icons/ChakraIcons'

const DISCLAIMER_ACCEPTED_KEY = 'mymultisig.disclaimer.accepted'

export const hasAcceptedDisclaimer = (): boolean => {
  try {
    return window.localStorage.getItem(DISCLAIMER_ACCEPTED_KEY) != null
  } catch {
    return false
  }
}

const rememberAcceptance = () => {
  try {
    window.localStorage.setItem(DISCLAIMER_ACCEPTED_KEY, 'true')
  } catch {
    // Storage blocked: the acknowledgement holds for this page view only.
  }
}

export interface DisclaimerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Called after the user accepts, once the acknowledgement is stored.
  onAccept: () => void
}

// Risk acknowledgement. Shown the first time someone connects a wallet (see
// ConnectWallet), not on the first page view: visitors can read the site
// before being asked to accept anything.
const Disclaimer: React.FC<DisclaimerProps> = ({ open, onOpenChange, onAccept }) => {
  const accept = () => {
    rememberAcceptance()
    onAccept()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={true}
        aria-describedby={undefined}
        className="max-w-[600px] border-border bg-card/98 shadow-2xl backdrop-blur-xl"
      >
        <DialogHeader className="pb-2 pt-6">
          <DialogTitle className="flex items-center gap-3">
            <span className="rounded-lg bg-primary/15 p-2">
              <WarningTwoIcon className="h-5 w-5 text-primary" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              Important disclaimer
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm leading-relaxed text-foreground">
            Welcome to MyMultiSig. This is an early-stage project; the smart contracts are
            open-source and available for review but have not been professionally audited. Some
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
          <Button className="w-full" size="lg" onClick={accept}>
            I understand and accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default Disclaimer
