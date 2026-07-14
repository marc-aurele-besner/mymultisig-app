import React, { Fragment, useEffect } from 'react'
import Link from 'next/link'
import { useChainId, useChains } from 'wagmi'
import { Button } from '@/components/ui/button'
import { CheckCircleIcon, ExternalLinkIcon, SettingsIcon, AddIcon } from '../icons/ChakraIcons'

import useConfirmation from '../../hooks/useConfirmation'
import useMyMultiSigCreated from '../../hooks/useMyMultiSigCreated'
import { MultiSigConstructorArgs } from '../../models/MultiSigs'
import { verifyContract } from '../../utils/api'

interface ConfirmationCardProps {
  hash: `0x${string}`
  multiSigFactoryAddress: `0x${string}`
  constructorArgs: MultiSigConstructorArgs
}

// Waits for the creation event, triggers contract verification, then shows the
// deployed wallet with next-step CTAs so the user can jump straight into it.
const ConfirmationWithEventDetailCard: React.FC<ConfirmationCardProps> = ({
  multiSigFactoryAddress,
  constructorArgs
}) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { multiSigAddress } = useMyMultiSigCreated(multiSigFactoryAddress)

  useEffect(() => {
    if (multiSigAddress && constructorArgs) {
      verifyContract({ contractAddress: multiSigAddress, constructorArgs })
    }
  }, [multiSigAddress, constructorArgs])

  if (!multiSigAddress) {
    return (
      <div className='flex items-center justify-center gap-3 rounded-xl border border-border bg-muted/30 p-4'>
        <span className='h-3 w-3 animate-pulse rounded-full bg-primary' />
        <span className='text-sm text-muted-foreground'>Waiting for the wallet address on-chain...</span>
      </div>
    )
  }

  const explorerUrl = chain?.blockExplorers?.default?.url

  return (
    <div className='flex w-full flex-col gap-4'>
      <div className='flex flex-col gap-1 rounded-xl border border-border bg-muted/30 p-4'>
        <span className='text-sm text-muted-foreground'>Your multisig address</span>
        <span className='break-all font-mono text-sm font-semibold text-foreground'>{multiSigAddress}</span>
      </div>
      <div className='flex flex-col gap-2 sm:flex-row'>
        <Button size='lg' className='flex-1 gap-2' asChild>
          <Link href={`/multisig/${multiSigAddress}`}>
            <AddIcon className='h-4 w-4' />
            Open your multisig
          </Link>
        </Button>
        <Button size='lg' variant='outline' className='flex-1 gap-2' asChild>
          <Link href={`/multisig/${multiSigAddress}/settings`}>
            <SettingsIcon className='h-4 w-4' />
            Owners & settings
          </Link>
        </Button>
        {explorerUrl && (
          <Button size='lg' variant='ghost' className='gap-2' asChild>
            <a href={`${explorerUrl}/address/${multiSigAddress}`} target='_blank' rel='noopener noreferrer'>
              <ExternalLinkIcon className='h-4 w-4' />
              Explorer
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}

const ConfirmationCard: React.FC<ConfirmationCardProps> = ({ hash, multiSigFactoryAddress, constructorArgs }) => {
  const { error, isLoading, isSuccess } = useConfirmation(hash)

  return (
    <Fragment>
      {isLoading && (
        <div className='flex items-center justify-center gap-3 rounded-xl border border-border bg-muted/30 p-4'>
          <span className='h-3 w-3 animate-pulse rounded-full bg-primary' />
          <span className='text-sm text-muted-foreground'>Waiting for the deployment to confirm...</span>
        </div>
      )}
      {error && <p className='text-sm font-semibold text-destructive'>Error: {error.message}</p>}
      {isSuccess && (
        <Fragment>
          <div className='flex items-center gap-2'>
            <CheckCircleIcon className='h-5 w-5 text-green-500' />
            <p className='text-lg font-bold text-green-600 dark:text-green-400'>
              Your multisig contract has been deployed!
            </p>
          </div>
          <ConfirmationWithEventDetailCard
            hash={hash}
            multiSigFactoryAddress={multiSigFactoryAddress}
            constructorArgs={constructorArgs}
          />
        </Fragment>
      )}
    </Fragment>
  )
}

export default ConfirmationCard
