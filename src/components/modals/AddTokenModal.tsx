import React, { useState } from 'react'
import { erc20Abi, formatUnits, isAddress } from 'viem'
import { useChainId, useChains, useReadContracts } from 'wagmi'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CoinsIcon } from '../icons/ChakraIcons'
import TextInput from '../inputs/TextInput'
import useCustomTokens from '../../states/customTokens'

interface AddTokenModalProps {
  multiSigAddress: `0x${string}`
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Track an ERC-20 by contract address, MetaMask-import style. The token is
// stored locally per chain and its balance read straight from the chain, so
// it also covers networks (or tokens) the indexer misses.
const AddTokenModal: React.FC<AddTokenModalProps> = ({ multiSigAddress, open, onOpenChange }) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const [tokenAddress, setTokenAddress] = useState('')
  const { tokens, addToken } = useCustomTokens()

  const tokenAddressValid = isAddress(tokenAddress)
  // name is optional in ERC-20, so reads allow individual failure; only
  // symbol + decimals decide whether this address really is a token.
  const { data: tokenData, isLoading } = useReadContracts({
    contracts: [
      { address: tokenAddress as `0x${string}`, abi: erc20Abi, functionName: 'symbol', chainId: chain?.id },
      { address: tokenAddress as `0x${string}`, abi: erc20Abi, functionName: 'decimals', chainId: chain?.id },
      { address: tokenAddress as `0x${string}`, abi: erc20Abi, functionName: 'name', chainId: chain?.id },
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [multiSigAddress],
        chainId: chain?.id
      }
    ],
    query: { enabled: tokenAddressValid }
  })

  const symbol = tokenData?.[0]?.status === 'success' ? String(tokenData[0].result) : null
  const decimals = tokenData?.[1]?.status === 'success' ? Number(tokenData[1].result) : null
  const name = tokenData?.[2]?.status === 'success' ? String(tokenData[2].result) : null
  const balance = tokenData?.[3]?.status === 'success' ? (tokenData[3].result as bigint) : null
  const isToken = symbol != null && decimals != null
  const notAToken = tokenAddressValid && tokenData != null && !isToken

  const alreadyAdded =
    tokenAddressValid &&
    tokens.some((t) => t.chainId === chain?.id && t.address.toLowerCase() === tokenAddress.toLowerCase())

  const close = (nextOpen: boolean) => {
    if (!nextOpen) setTokenAddress('')
    onOpenChange(nextOpen)
  }

  const add = () => {
    if (!isToken || chain == null) return
    addToken({
      chainId: chain.id,
      address: tokenAddress,
      symbol,
      name: name ?? symbol,
      decimals
    })
    toast.success(`${symbol} added to this wallet's token list.`)
    close(false)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent showClose={true} className='max-w-[480px] border-border bg-card/98 backdrop-blur-xl'>
        <DialogHeader className='pb-2 pt-6'>
          <DialogTitle className='font-display text-xl font-bold tracking-tight text-foreground'>
            Add a token
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-4 pb-6'>
          <p className='text-sm leading-relaxed text-muted-foreground'>
            Track any ERC-20 token on {chain?.name ?? 'this network'} by its contract address. Its balance is read
            straight from the chain, so this also works for tokens the indexer misses.
          </p>

          <div className='flex flex-col gap-1'>
            <TextInput
              placeholder='Token contract address (0x...)'
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value.trim())}
              isInvalid={tokenAddress !== '' && !tokenAddressValid}
              className='md:w-full'
            />
            {tokenAddress !== '' && !tokenAddressValid && (
              <span className='text-xs text-destructive'>This is not a valid address.</span>
            )}
            {tokenAddressValid && isLoading && (
              <span className='text-xs text-muted-foreground'>Reading the token...</span>
            )}
            {notAToken && (
              <span className='text-xs text-destructive'>
                This address does not respond like an ERC-20 on {chain?.name ?? 'this network'}.
              </span>
            )}
          </div>

          {isToken && (
            <div className='flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3'>
              <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted'>
                <CoinsIcon className='h-4 w-4 text-muted-foreground' />
              </span>
              <div className='flex min-w-0 flex-1 flex-col'>
                <span className='text-sm font-medium text-foreground'>{symbol}</span>
                <span className='truncate text-xs text-muted-foreground'>{name ?? tokenAddress}</span>
              </div>
              {balance != null && (
                <span className='font-mono text-sm text-foreground'>
                  {Number(formatUnits(balance, decimals)).toLocaleString(undefined, { maximumFractionDigits: 5 })}
                </span>
              )}
            </div>
          )}

          {alreadyAdded && (
            <p className='rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground'>
              This token is already in the list.
            </p>
          )}

          <Button size='lg' disabled={!isToken || alreadyAdded} onClick={add} className='w-full'>
            {isToken ? `Add ${symbol}` : 'Add token'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddTokenModal
