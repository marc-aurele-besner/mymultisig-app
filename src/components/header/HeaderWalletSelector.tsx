import React, { useState, useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDownIcon, CheckIcon } from '../icons/ChakraIcons'
import { useAccount, useDisconnect } from 'wagmi'
import { motion } from 'framer-motion'
import { WalletIcon } from '../icons/wallet'
import useConnectModal from '../../states/connectModal'

const MotionButton = motion(Button)

// Top bar wallet control. Disconnected, it opens the connect dialog (wallet
// options with their logos). Connected, it is the account menu.
export const HeaderWalletSelector: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { connector, address } = useAccount()
  const { disconnect } = useDisconnect()
  const { setOpen } = useConnectModal()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!connector || !address) {
    return (
      <MotionButton
        size="sm"
        className="gap-2 font-semibold"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(true)}
        aria-label="Connect a wallet"
      >
        <WalletIcon className="h-[18px] w-[18px]" />
        <span className="hidden text-sm md:inline">Connect</span>
      </MotionButton>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MotionButton
          size="sm"
          variant="outline"
          className="gap-2 border-border bg-card font-semibold text-foreground hover:bg-accent"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="font-mono text-xs md:text-sm">{truncateAddress(address)}</span>
          <ChevronDownIcon className="h-4 w-4 opacity-70" />
        </MotionButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuLabel className="normal-case">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Connected with
          </div>
          <div className="mt-1 flex items-center gap-1">
            <CheckIcon className="h-3 w-3 text-primary" />
            <span className="text-sm font-medium">{connector.name}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => disconnect?.()}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <span className="text-sm font-medium">Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
