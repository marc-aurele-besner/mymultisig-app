import { useEffect, useState } from 'react'
import { useAccount, useChainId, useChains, useSignTypedData } from 'wagmi'
import { v4 } from 'uuid'

import { useNotificationSuccess, useNotificationError } from './notifications'
import useMultiSigDetails from './useMultiSigDetails'
import useWalletType from './useWalletType'
import { MultiSigExecTransactionArgs, MultiSigTransactionRequest } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'
import { addContent, updateContent } from '../utils'
import { buildTransactionTypedData } from '../utils/transactionTypedData'
import { combineSignatures } from '../utils/signatureBlob'

const useSignedMultiSigRequest = (
  multiSigAddress: `0x${string}`,
  args: MultiSigExecTransactionArgs,
  description: string,
  existingRequest?: MultiSigTransactionRequest,
  existingRequestId?: string
) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { address } = useAccount()
  const { addMultiSigTransactionRequest, updateMultiSigTransactionRequest } = useMultiSigs()
  const { data: multiSigDetails } = useMultiSigDetails(multiSigAddress, address || '0x')
  const [dataAdded, setDataAdded] = useState(false)
  const notificationError = useNotificationError(
    'Error Signing MultiSig Request',
    'There was an error signing MultiSig request.'
  )
  const notificationSuccess = useNotificationSuccess(
    'Successfully Signing MultiSig Request',
    'You signed the MultiSig request successfully.'
  )
  const { walletType, isFetched: walletTypeFetched } = useWalletType(multiSigAddress)
  const walletVersion = multiSigDetails ? String(multiSigDetails[1]) : undefined

  const isNumber = (value: string | number): boolean =>
    value != null && value !== '' && !isNaN(Number(value.toString()))

  const valueCheck = isNumber(args.value)
  const gasCheck = isNumber(args.txnGas)

  const valueAndGasCheck = valueCheck && gasCheck ? true : false

  // The struct the wallet's typehash binds depends on its deployed version
  // (0.5.0 adds validUntil, and operation on Extended), so signing must wait
  // until both the on-chain details and the wallet type probe have answered.
  const typedDataReady = multiSigDetails != null && walletTypeFetched
  const typedData = buildTransactionTypedData({
    domain: {
      name: multiSigDetails ? String(multiSigDetails[0]) : 'MyMultiSigFactory',
      version: walletVersion ?? '0.0.7',
      chainId: chain?.id,
      verifyingContract: multiSigAddress
    },
    args,
    // Requests pinned to an explicit nonce (Extended wallets) must be signed
    // against that nonce; everything else signs the wallet's current nonce.
    nonce:
      args.txnNonce != null && args.txnNonce !== ''
        ? BigInt(args.txnNonce)
        : BigInt(multiSigDetails?.[4] != null ? String(multiSigDetails[4]) : 0),
    walletVersion,
    isExtended: walletType === 'extended'
  })

  const { data, isError, isPending, isSuccess, error, signTypedData, reset } = useSignTypedData()

  useEffect(() => {
    if (error) {
      notificationError()
    }
  }, [error, notificationError])

  useEffect(() => {
    if (isSuccess && data) {
      notificationSuccess()
    }
  }, [isSuccess, data, notificationSuccess])

  useEffect(() => {
    if (isSuccess && data && chain && !dataAdded) {
      setDataAdded(true)
      // request.signatures always holds the combined blob the wallet consumes:
      // rebuilt from the parallel ownerSigners/signatures arrays so the
      // version-specific encoding (flat concat pre-0.5.0, ABI-encoded
      // (owner, sig)[] on 0.5.0) stays consistent as votes accumulate.
      const allSigners = existingRequest
        ? [...existingRequest.ownerSigners, address || '0x']
        : [address || '0x']
      const allSignatures = existingRequest ? [...existingRequest.signatures, data || '0x'] : [data || '0x']
      const combined = combineSignatures(walletVersion, allSigners, allSignatures)
      const dataToAdd: MultiSigTransactionRequest = existingRequest
        ? {
            ...existingRequest,
            request: {
              ...existingRequest.request,
              signatures: combined
            },
            signatures: allSignatures,
            ownerSigners: allSigners as `0x${string}`[]
          }
        : {
            id: v4(),
            multiSigAddress: multiSigAddress,
            request: {
              ...args,
              signatures: combined
            },
            description,
            submitter: address || '0x',
            signatures: [data || '0x'],
            ownerSigners: [address || '0x'],
            dateSubmitted: Date.now().toString(),
            dateExecuted: '',
            isActive: true,
            isExecuted: false,
            isCancelled: false,
            isConfirmed: false,
            isSuccessful: false
          }
      if (existingRequest && existingRequestId)
        updateContent({ action: 'updateMultiSigRequest', data: dataToAdd }, existingRequestId).then(() => {
          updateMultiSigTransactionRequest(existingRequest.id, dataToAdd)
        })
      else
        addContent({ action: 'addMultiSigRequest', data: dataToAdd }).then(() => {
          addMultiSigTransactionRequest(dataToAdd)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    existingRequest,
    dataAdded,
    isSuccess,
    data,
    multiSigAddress,
    address,
    chain,
    args,
    description,
    addMultiSigTransactionRequest
  ])

  return {
    isPrepareError: !valueAndGasCheck,
    data,
    isError,
    isPending,
    isSuccess,
    prepareError: !valueAndGasCheck ? null : 'Invalid value or gas',
    error,
    // No-op until the wallet's version/type are known — signing the wrong
    // struct shape would produce a signature the wallet rejects.
    signTypedData: () => {
      if (typedDataReady) signTypedData(typedData)
    },
    reset
  }
}

export default useSignedMultiSigRequest
