import React, { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import { useChainId, useChains } from 'wagmi'
import { Button } from '@/components/ui/button'
import { CheckCircleIcon, SettingsIcon, DownloadIcon } from '../icons/ChakraIcons'

import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import useWalletType from '../../hooks/useWalletType'
import { MultiSig } from '../../models/MultiSigs'
import useMultiSigs from '../../states/multiSigs'
import { addContent } from '../../utils'

interface ImportConfirmationCardProps {
  factoryAddress: `0x${string}`
  multiSigAddress: `0x${string}`
  address: `0x${string}`
  // When provided, shows an "Import another" action that resets the parent form.
  onImportAnother?: () => void
}

const ImportConfirmationCard: React.FC<ImportConfirmationCardProps> = ({
  factoryAddress,
  multiSigAddress,
  address,
  onImportAnother
}) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { data, isLoading, error, isSuccess } = useMultiSigDetails(multiSigAddress, address)
  const { walletType, allowOnlyOwnerRequest, isFetched: isTypeFetched } = useWalletType(multiSigAddress)
  const { addMultiSig, multiSigs } = useMultiSigs()
  const [imported, setImported] = useState(false)

  useEffect(() => {
    if (imported || !chain || !isTypeFetched || data == null || data.length !== 6) return
    if (multiSigs.some((m) => m.address.toLowerCase() === multiSigAddress.toLowerCase())) {
      setImported(true)
      return
    }
    const isOwner = Boolean(data[5])
    const newMultiSig: MultiSig = {
      chainId: chain.id,
      chainName: chain.name,
      factoryAddress,
      id: 0,
      name: String(data[0]),
      version: String(data[1]),
      address: multiSigAddress,
      threshold: Number(data[2]),
      ownerCount: Number(data[3]),
      nonce: Number(data[4]),
      // The contract stores owners as a mapping (no getOwners()), so an import
      // can only seed the list with the importer; admin executions keep it in
      // sync afterwards.
      owners: isOwner ? [address] : [],
      isDeployed: true,
      walletType,
      allowOnlyOwnerRequest
    }
    setImported(true)
    addMultiSig(newMultiSig)
    void addContent({ action: 'createMultiSigWallet', data: newMultiSig })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imported, chain, isTypeFetched, data, multiSigAddress])

  return (
    <Fragment>
      {isLoading && (
        <div className='flex items-center justify-center gap-3 rounded-xl border border-border bg-muted/30 p-4'>
          <span className='h-3 w-3 animate-pulse rounded-full bg-primary' />
          <span className='text-sm text-muted-foreground'>Reading the multisig contract...</span>
        </div>
      )}
      {error && <p className='text-sm font-semibold text-destructive'>Error: {error.message}</p>}
      {isSuccess && imported && (
        <div className='flex w-full flex-col gap-4'>
          <div className='flex items-center gap-2'>
            <CheckCircleIcon className='h-5 w-5 text-green-500' />
            <p className='text-lg font-bold text-green-600 dark:text-green-400'>
              Your {walletType === 'extended' ? 'Extended ' : ''}multisig has been imported!
            </p>
          </div>
          <div className='flex flex-col gap-1 rounded-xl border border-border bg-muted/30 p-4'>
            <span className='text-sm text-muted-foreground'>{data != null ? String(data[0]) : 'Multisig'}</span>
            <span className='break-all font-mono text-sm font-semibold text-foreground'>{multiSigAddress}</span>
          </div>
          <div className='flex flex-col gap-2 sm:flex-row'>
            <Button size='lg' className='flex-1 gap-2' asChild>
              <Link href={`/multisig/${multiSigAddress}`}>
                <CheckCircleIcon className='h-4 w-4' />
                Open your multisig
              </Link>
            </Button>
            <Button size='lg' variant='outline' className='flex-1 gap-2' asChild>
              <Link href={`/multisig/${multiSigAddress}/settings`}>
                <SettingsIcon className='h-4 w-4' />
                Owners & settings
              </Link>
            </Button>
            {onImportAnother != null && (
              <Button size='lg' variant='ghost' className='gap-2' onClick={onImportAnother}>
                <DownloadIcon className='h-4 w-4' />
                Import another
              </Button>
            )}
          </div>
        </div>
      )}
    </Fragment>
  )
}

export default ImportConfirmationCard
