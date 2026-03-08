import React, { Fragment, useEffect } from 'react'
import useConfirmation from '../../hooks/useConfirmation'
import useMyMultiSigCreated from '../../hooks/useMyMultiSigCreated'
import { MultiSigConstructorArgs } from '../../models/MultiSigs'
import { verifyContract } from '../../utils/api'

interface ConfirmationCardProps {
  hash: `0x${string}`
  multiSigFactoryAddress: `0x${string}`
  constructorArgs: MultiSigConstructorArgs
}

const ConfirmationWithEventDetailCard: React.FC<ConfirmationCardProps> = ({
  multiSigFactoryAddress,
  constructorArgs
}) => {
  const { multiSigAddress } = useMyMultiSigCreated(multiSigFactoryAddress)

  const handleVerification = async (
    contractAddress: string,
    args: MultiSigConstructorArgs
  ) => {
    await verifyContract({ contractAddress, constructorArgs: args })
  }

  useEffect(() => {
    if (multiSigAddress && constructorArgs) {
      handleVerification(multiSigAddress, constructorArgs)
    }
  }, [multiSigAddress, constructorArgs])

  return (
    <Fragment>
      {multiSigAddress && (
        <p className="text-lg font-bold text-foreground">Address: {multiSigAddress}</p>
      )}
    </Fragment>
  )
}

const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  hash,
  multiSigFactoryAddress,
  constructorArgs
}) => {
  const { data, error, isLoading, isSuccess } = useConfirmation(hash)

  return (
    <Fragment>
      {isLoading && (
        <p className="text-lg font-bold text-foreground">Loading...</p>
      )}
      {error && (
        <p className="text-lg font-bold text-foreground">Error: {error.message}</p>
      )}
      {isSuccess && (
        <Fragment>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            Your multisig contract has been deployed!
          </p>
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
