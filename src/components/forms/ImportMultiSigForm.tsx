import React, { Fragment, useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { ImportIcon } from '../icons/ChakraIcons'
import TextInput from '../inputs/TextInput'
import ImportConfirmationCard from '../cards/ImportConfirmationCard'
import { MultiSigFactory } from '../../models/MultiSigs'

interface ImportMultiSigFormProps {
  factory: MultiSigFactory
}

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)

const ImportMultiSigForm: React.FC<ImportMultiSigFormProps> = ({ factory }) => {
  const { address } = useAccount()
  const [multiSigAddress, setMultiSigAddress] = useState('')
  const [importClicked, setImportClicked] = useState(false)

  const addressValid = isAddress(multiSigAddress)

  return (
    <div className='flex flex-col gap-4'>
      {importClicked && address != null ? (
        <ImportConfirmationCard
          factoryAddress={factory.address}
          multiSigAddress={multiSigAddress as `0x${string}`}
          address={address}
          onImportAnother={() => {
            setMultiSigAddress('')
            setImportClicked(false)
          }}
        />
      ) : (
        <Fragment>
          <div>
            <label htmlFor='import-address' className='block text-sm font-semibold text-foreground'>
              Contract address
            </label>
            <p className='mt-1 text-sm text-muted-foreground'>
              Paste the address of a multisig deployed through this factory.
            </p>
          </div>
          <TextInput
            id='import-address'
            placeholder='0x…'
            value={multiSigAddress}
            isInvalid={multiSigAddress !== '' && !addressValid}
            onChange={(e) => setMultiSigAddress(e.target.value.trim())}
            className='font-mono md:w-full'
            spellCheck={false}
            autoComplete='off'
          />
          {multiSigAddress !== '' && !addressValid && (
            <span className='-mt-2 text-xs text-destructive'>
              An address is 42 characters starting with 0x — this one has {multiSigAddress.length}.
            </span>
          )}
          <Button
            size='lg'
            className='gap-2 self-start'
            onClick={() => setImportClicked(true)}
            disabled={!addressValid}
          >
            <ImportIcon className='h-4 w-4' />
            Import multisig
          </Button>
        </Fragment>
      )}
    </div>
  )
}

export default ImportMultiSigForm
