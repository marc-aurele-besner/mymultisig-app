import React, { Fragment, useEffect, useState } from 'react'
import { useChainId, useChains } from 'wagmi'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import useWalletType from '../../hooks/useWalletType'
import { MultiSig } from '../../models/MultiSigs'
import useMultiSigs from '../../states/multiSigs'
import { signData, addContent } from '../../utils'

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
    signData({
      action: 'createMultiSigWallet',
      chainId: chain.id,
      collection: 'multisig-wallets',
      data: newMultiSig,
      details: 'Add MultiSig Wallets',
      signatureExpiry: 0
    }).then(async (dataSigned) => {
      addContent(dataSigned.message)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imported, chain, isTypeFetched, data, multiSigAddress])

  return (
    <Fragment>
      {isLoading && (
        <p className="text-lg font-bold text-foreground">Loading...</p>
      )}
      {error && (
        <p className="text-lg font-bold text-foreground">Error: {error.message}</p>
      )}
      {isSuccess && imported && (
        <p className="text-lg font-bold text-green-600 dark:text-green-400">
          Your {walletType === 'extended' ? 'Extended ' : ''}multisig contract has been imported!
        </p>
      )}
    </Fragment>
  )
}

export default ImportConfirmationCard
