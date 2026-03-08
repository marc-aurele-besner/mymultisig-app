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
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { motion } from 'framer-motion'
import { WalletIcon } from '../icons/wallet'
import { cn } from '@/lib/utils'

const MotionButton = motion(Button)

export const HeaderWalletSelector: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { connector, address } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MotionButton
          size="sm"
          className={cn(
            'gap-2 font-semibold',
            connector && address
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border border-border bg-muted/50 hover:bg-muted'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {connector && address ? (
            <>
              <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-xs md:text-sm">{truncateAddress(address)}</span>
              <ChevronDownIcon className="h-4 w-4 opacity-70" />
            </>
          ) : (
            <>
              <WalletIcon className="h-[18px] w-[18px] text-muted-foreground" />
              <span className="hidden text-sm md:inline">Connect</span>
            </>
          )}
        </MotionButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {!connector ? (
          connectors.map((item) => (
            <DropdownMenuItem
              key={`MenuItem-${item.name}`}
              onClick={() => {
                const c = connectors.find((x) => x.id === item.id)
                if (c) connect({ connector: c })
              }}
            >
              <span className="text-sm font-medium">{item.name}</span>
            </DropdownMenuItem>
          ))
        ) : (
          <>
            <DropdownMenuLabel className="normal-case">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Connected with
              </div>
              <div className="mt-1 flex items-center gap-1">
                <CheckIcon className="h-3 w-3 text-green-500" />
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
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
