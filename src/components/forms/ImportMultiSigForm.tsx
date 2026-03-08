import React, { Fragment, useState } from 'react'
import { useAccount } from 'wagmi'
import TextInput from '../inputs/TextInput'
import ImageButton from '../buttons/ImageButton'
import ImportConfirmationCard from '../cards/ImportConfirmationCard'
import { MultiSigFactory } from '../../models/MultiSigs'

interface ImportMultiSigFormProps {
  factory: MultiSigFactory
}

const ImportMultiSigForm: React.FC<ImportMultiSigFormProps> = ({ factory }) => {
  const { address } = useAccount()
  const [multiSigAddress, setMultiSigAddress] = useState<`0x${string}`>('0x')
  const [importClicked, setImportClicked] = useState<boolean>(false)

  const handleImportMultiSig = () => {
    setImportClicked(true)
  }

  const handleChangeAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length === 42) {
      setMultiSigAddress(`0x${e.target.value.substring(2, e.target.value.length)}` as `0x${string}`)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {importClicked && address != null ? (
        <ImportConfirmationCard
          factoryAddress={factory.address}
          multiSigAddress={multiSigAddress}
          address={address}
        />
      ) : (
        <Fragment>
          <h3 className="pb-4 text-2xl font-bold text-foreground">
            The multi sig contract address
          </h3>
          <TextInput placeholder="MultiSig Address" onChange={handleChangeAddress} />
          <ImageButton
            placeholder="Import"
            imagePath="/images/import.png"
            onClick={handleImportMultiSig}
            disabled={multiSigAddress === '0x'}
          />
        </Fragment>
      )}
    </div>
  )
}

export default ImportMultiSigForm
