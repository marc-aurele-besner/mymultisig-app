import React from 'react'
import { Text } from '@chakra-ui/react'
import { useNetwork } from 'wagmi'

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
  const { chain } = useNetwork()
  const { data, isLoading, error, isSuccess } = useMultiSigDetails(multiSigAddress, address)
  const { addMultiSig } = useMultiSigs()

  if (data && data.length == 6 && chain) {
    const newMultiSig: MultiSig = {
      chainId: chain.id,
      chainName: chain.name,
      factoryAddress: factoryAddress,
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

  console.log('data', data)
  return (
    <>
      {isLoading && (
        <Text fontSize='lg' fontWeight='bold' color='white'>
          Loading...
        </Text>
      )}
      {error && (
        <Text fontSize='lg' fontWeight='bold' color='white'>
          Error: {error.message}
        </Text>
      )}
      {isSuccess && (
        <>
          <Text fontSize='lg' fontWeight='bold' color='white'>
            Your multisig contract has been imported!
          </Text>
        </>
      )}
    </>
  )
}

export default ImportConfirmationCard
