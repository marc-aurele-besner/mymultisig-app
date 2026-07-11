import React, { useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { ChevronDownIcon, CheckIcon } from '../icons/ChakraIcons'
import NetworkIcon from '../icons/NetworkIcon'
import { useChainId, useChains, useSwitchChain } from 'wagmi'

const HeaderNetworkSelector: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const chainId = useChainId()
  const allChains = useChains()
  const chain = allChains.find((c) => c.id === chainId)
  const { chains: switchableChains, switchChain } = useSwitchChain()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted || !chain || !switchableChains) return null

  const mainnets = switchableChains.filter((c) => !c.testnet)
  const testnets = switchableChains.filter((c) => c.testnet)

  const selectChain = (id: number) => {
    switchChain({ chainId: id })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Switch network"
          className="gap-2 border-border bg-card font-medium text-foreground hover:bg-accent"
        >
          <NetworkIcon chainId={chain.id} name={chain.name} size={16} />
          <span className="max-w-[120px] truncate text-xs md:text-sm">{chain.name}</span>
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[248px] p-0">
        <Command>
          <CommandInput placeholder="Search networks…" />
          <CommandList>
            <CommandEmpty>No network matches your search.</CommandEmpty>
            <CommandGroup heading="MAINNETS">
              {mainnets.map((item) => (
                <CommandItem key={item.id} value={item.name} onSelect={() => selectChain(item.id)}>
                  <NetworkIcon chainId={item.id} name={item.name} size={18} />
                  <span className="flex-1 truncate">{item.name}</span>
                  {chain.id === item.id && <CheckIcon className="h-3.5 w-3.5 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>
            {testnets.length > 0 && (
              <CommandGroup heading="TESTNETS">
                {testnets.map((item) => (
                  <CommandItem key={item.id} value={item.name} onSelect={() => selectChain(item.id)}>
                    <NetworkIcon chainId={item.id} name={item.name} size={18} />
                    <span className="flex-1 truncate">{item.name}</span>
                    {chain.id === item.id && <CheckIcon className="h-3.5 w-3.5 text-primary" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default HeaderNetworkSelector
