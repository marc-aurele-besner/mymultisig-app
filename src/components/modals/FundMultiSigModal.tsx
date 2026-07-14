import React, { useMemo, useState } from 'react'
import { erc20Abi, formatUnits, isAddress, parseUnits } from 'viem'
import { useAccount, useBalance, useChainId, useChains, useReadContracts } from 'wagmi'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CheckCircleIcon, ExternalLinkIcon } from '../icons/ChakraIcons'
import TextInput from '../inputs/TextInput'
import useFundMultiSig from '../../hooks/useFundMultiSig'

type AssetType = 'native' | 'token'

interface FundMultiSigModalProps {
  multiSigAddress: `0x${string}`
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Deposit into the multisig from the connected wallet. Anyone can fund a
// wallet (not just owners); the transfer goes straight on-chain without a
// multisig request.
const FundMultiSigModal: React.FC<FundMultiSigModalProps> = ({ multiSigAddress, open, onOpenChange }) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { address, isConnected } = useAccount()
  const [assetType, setAssetType] = useState<AssetType>('native')
  const [tokenAddress, setTokenAddress] = useState('')
  const [amount, setAmount] = useState('')
  const { fundNative, fundToken, hash, isFinal, isPending, reset } = useFundMultiSig(multiSigAddress)

  const { data: nativeBalance } = useBalance({ address, chainId: chain?.id, query: { enabled: !!address } })

  const tokenAddressValid = isAddress(tokenAddress)
  const { data: tokenData } = useReadContracts({
    contracts: [
      { address: tokenAddress as `0x${string}`, abi: erc20Abi, functionName: 'symbol', chainId: chain?.id },
      { address: tokenAddress as `0x${string}`, abi: erc20Abi, functionName: 'decimals', chainId: chain?.id },
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address ?? '0x'],
        chainId: chain?.id
      }
    ],
    allowFailure: false,
    query: { enabled: tokenAddressValid && !!address }
  })

  const isNative = assetType === 'native'
  const symbol = isNative ? (chain?.nativeCurrency.symbol ?? 'ETH') : tokenData != null ? String(tokenData[0]) : null
  const decimals = isNative ? (chain?.nativeCurrency.decimals ?? 18) : tokenData != null ? Number(tokenData[1]) : null
  const balance = isNative ? nativeBalance?.value : tokenData != null ? BigInt(tokenData[2]) : undefined

  const parsedAmount = useMemo(() => {
    if (decimals == null || amount.trim() === '') return null
    try {
      const value = parseUnits(amount.trim(), decimals)
      return value > 0n ? value : null
    } catch {
      return null
    }
  }, [amount, decimals])

  const exceedsBalance = parsedAmount != null && balance != null && parsedAmount > balance
  const canSend =
    isConnected &&
    parsedAmount != null &&
    !exceedsBalance &&
    !isPending &&
    hash == null &&
    (isNative || tokenAddressValid)
  const explorerUrl = chain?.blockExplorers?.default?.url

  const send = () => {
    if (parsedAmount == null) return
    if (isNative) fundNative(parsedAmount)
    else if (tokenAddressValid) fundToken(tokenAddress as `0x${string}`, parsedAmount)
  }

  const close = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset()
      setAmount('')
    }
    onOpenChange(nextOpen)
  }

  const selectAsset = (type: AssetType) => {
    setAssetType(type)
    setAmount('')
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent showClose={true} className='max-w-[480px] border-border bg-card/98 backdrop-blur-xl'>
        <DialogHeader className='pb-2 pt-6'>
          <DialogTitle className='font-display text-xl font-bold tracking-tight text-foreground'>
            Fund this wallet
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-4 pb-6'>
          <p className='text-sm leading-relaxed text-muted-foreground'>
            Send {chain?.nativeCurrency.symbol ?? 'native currency'} or any ERC-20 token from your connected wallet
            straight to the multisig. This is a regular transfer; no signatures from other owners are needed.
          </p>

          {isFinal && hash ? (
            <div className='flex flex-col items-start gap-3 rounded-lg border border-border bg-muted/30 p-4'>
              <span className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                <CheckCircleIcon className='h-4 w-4 text-primary' />
                Funds sent
              </span>
              <span className='break-all font-mono text-xs text-muted-foreground'>{hash}</span>
              <div className='flex flex-wrap gap-3'>
                {explorerUrl && (
                  <Button variant='outline' size='sm' asChild>
                    <a href={`${explorerUrl}/tx/${hash}`} target='_blank' rel='noopener noreferrer' className='gap-1.5'>
                      View on explorer
                      <ExternalLinkIcon className='h-3 w-3' />
                    </a>
                  </Button>
                )}
                <Button size='sm' onClick={() => close(false)}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <div className='flex flex-col gap-3'>
              <div className='grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/30 p-1'>
                {(['native', 'token'] as const).map((type) => (
                  <button
                    key={type}
                    type='button'
                    onClick={() => selectAsset(type)}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      assetType === type
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {type === 'native' ? (chain?.nativeCurrency.symbol ?? 'Native') : 'ERC-20 token'}
                  </button>
                ))}
              </div>

              {!isNative && (
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
                  {tokenAddressValid && tokenData == null && (
                    <span className='text-xs text-muted-foreground'>
                      Reading the token... make sure it is an ERC-20 on {chain?.name}.
                    </span>
                  )}
                </div>
              )}

              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <TextInput
                    placeholder={symbol != null ? `Amount in ${symbol}` : 'Amount'}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    inputMode='decimal'
                    isInvalid={amount.trim() !== '' && (parsedAmount == null || exceedsBalance)}
                    className='md:w-full'
                  />
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={balance == null || decimals == null}
                    onClick={() => balance != null && decimals != null && setAmount(formatUnits(balance, decimals))}
                  >
                    Max
                  </Button>
                </div>
                {balance != null && decimals != null && (
                  <span className='text-xs text-muted-foreground'>
                    Your balance:{' '}
                    {Number(formatUnits(balance, decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 })}{' '}
                    {symbol}
                  </span>
                )}
                {exceedsBalance && <span className='text-xs text-destructive'>Amount exceeds your balance.</span>}
              </div>

              {!isConnected ? (
                <p className='rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground'>
                  Connect a wallet (top right) to send funds.
                </p>
              ) : (
                <Button size='lg' disabled={!canSend} onClick={send} className='w-full'>
                  {isPending
                    ? 'Confirm in your wallet…'
                    : hash != null
                      ? 'Waiting for confirmation…'
                      : symbol != null && parsedAmount != null
                        ? `Send ${amount.trim()} ${symbol}`
                        : 'Send funds'}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FundMultiSigModal
