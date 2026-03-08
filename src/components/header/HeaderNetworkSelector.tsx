import React, { useState, useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDownIcon, CheckIcon } from '../icons/ChakraIcons'
import { useChainId, useChains, useSwitchChain } from 'wagmi'
import { motion } from 'framer-motion'

const MotionButton = motion(Button)

const HeaderNetworkSelector: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const chainId = useChainId()
  const allChains = useChains()
  const chain = allChains.find((c) => c.id === chainId)
  const { chains: switchableChains, switchChain } = useSwitchChain()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted || !chain || !switchableChains) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MotionButton
          variant="outline"
          size="sm"
          className="gap-2 border-border bg-background/80 backdrop-blur-sm font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-xs md:text-sm">{chain.name}</span>
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </MotionButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {switchableChains.map((item) => (
          <DropdownMenuItem
            key={`MenuItem-${item.name}`}
            onClick={() => switchChain({ chainId: item.id })}
            className="flex w-full items-center justify-between"
          >
            <span className="text-sm font-medium">{item.name}</span>
            {chain.id === item.id && (
              <CheckIcon className="h-3 w-3 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default HeaderNetworkSelector
