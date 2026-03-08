import React, { Fragment } from 'react'
import { useChainId, useChains } from 'wagmi'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import { MultiSig } from '../../models/MultiSigs'
import useMultiSigs from '../../states/multiSigs'

interface ImportConfirmationCardProps {
  factoryAddress: `0x${string}`
  multiSigAddress: `0x${string}`
  address: `0x${string}`
}

const ImportConfirmationCard: React.FC<ImportConfirmationCardProps> = ({
  factoryAddress,
  multiSigAddress,
  address
}) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { data, isLoading, error, isSuccess } = useMultiSigDetails(
    multiSigAddress,
    address
  )
  const { addMultiSig } = useMultiSigs()

  if (data && data.length === 6 && chain) {
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
      owners: Array(data[5]).map((owner) => String(owner)),
      isDeployed: true
    }
    addMultiSig(newMultiSig)
  }

  return (
    <Fragment>
      {isLoading && (
        <p className="text-lg font-bold text-foreground">Loading...</p>
      )}
      {error && (
        <p className="text-lg font-bold text-foreground">Error: {error.message}</p>
      )}
      {isSuccess && (
        <p className="text-lg font-bold text-green-600 dark:text-green-400">
          Your multisig contract has been imported!
        </p>
      )}
    </Fragment>
  )
}

export default ImportConfirmationCard
