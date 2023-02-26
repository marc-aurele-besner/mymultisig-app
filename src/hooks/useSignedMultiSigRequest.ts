import { useEffect, useState } from 'react'
import { useAccount, useNetwork, useSignTypedData } from 'wagmi'
import { BigNumber } from 'ethers'
import { v4 } from 'uuid'

import { useNotificationSuccess, useNotificationError } from './notifications'
import useMultiSigDetails from './useMultiSigDetails'
import { MultiSigExecTransactionArgs, MultiSigTransactionRequest } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'
import { signData, addContent, updateContent } from '../utils'

const useSignedMultiSigRequest = (
  multiSigAddress: `0x${string}`,
  args: MultiSigExecTransactionArgs,
  existingRequest?: MultiSigTransactionRequest,
  existingRequestRef?: string
) => {
  const { chain } = useNetwork()
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

  const domain = {
    name: multiSigDetails ? String(multiSigDetails[0]) : 'MyMultiSigFactory',
    version: multiSigDetails ? String(multiSigDetails[1]) : '0.0.7',
    chainId: chain?.id,
    verifyingContract: multiSigAddress
  } as const

  const types = {
    Transaction: [
      {
        name: 'to',
        type: 'address'
      },
      {
        name: 'value',
        type: 'uint256'
      },
      {
        name: 'data',
        type: 'bytes'
      },
      {
        name: 'gas',
        type: 'uint256'
      },
      {
        name: 'nonce',
        type: 'uint96'
      }
    ]
  } as const

  const value = {
    to: args.to,
    value: BigNumber.from(args.value),
    data: args.data,
    gas: BigNumber.from(args.txnGas),
    nonce: BigNumber.from(multiSigDetails ? multiSigDetails[2] : 0)
  } as const

  const { data, isError, isLoading, isSuccess, signTypedData } = useSignTypedData({
    domain,
    types,
    value,
    onError() {
      notificationError()
    },
    onSuccess() {
      notificationSuccess()
    }
  })

  useEffect(() => {
    if (isSuccess && chain && !dataAdded) {
      setDataAdded(true)
      const dataToAdd: MultiSigTransactionRequest = existingRequest
        ? {
            ...existingRequest,
            request: {
              ...existingRequest.request,
              signatures:
                existingRequest.request.signatures === ''
                  ? data || '0x'
                  : existingRequest.request.signatures + data?.substring(2)
            },
            signatures: [...existingRequest.signatures, data || '0x'],
            ownerSigners: [...existingRequest.ownerSigners, address || '0x']
          }
        : {
            id: v4(),
            multiSigAddress: multiSigAddress,
            request: {
              ...args,
              signatures: args.signatures === '' ? data || '0x' : args.signatures + data?.substring(2)
            },
            description: 'Add MultiSig Request',
            submitter: address || '0x',
            signatures: [data || '0x'],
            ownerSigners: [address || '0x'],
            dateSubmitted: Date.now().toString(),
            dateExecuted: '',
            isActive: true,
            isExecuted: false,
            isCancelled: false,
            isConfirmed: false
          }
      if (existingRequest && existingRequestRef)
        signData({
          action: 'updateMultiSigRequest',
          chainId: chain.id,
          collection: 'multisig-requests',
          data: dataToAdd,
          details: 'Update MultiSig Request',
          signatureExpiry: 0
        }).then(async (dataSigned) => {
          updateContent(dataSigned.message, existingRequestRef).then(() => {
            updateMultiSigTransactionRequest(existingRequest.id, dataToAdd)
          })
        })
      else
        signData({
          action: 'addMultiSigRequest',
          chainId: chain.id,
          collection: 'multisig-requests',
          data: dataToAdd,
          details: 'Add MultiSig Request',
          signatureExpiry: 0
        }).then(async (dataSigned) => {
          addContent(dataSigned.message).then(() => {
            addMultiSigTransactionRequest(dataToAdd)
          })
        })
    }
  }, [
    existingRequest,
    dataAdded,
    isSuccess,
    data,
    multiSigAddress,
    address,
    chain,
    args,
    addMultiSigTransactionRequest
  ])

  return { data, isError, isLoading, isSuccess, signTypedData }
}

export default useSignedMultiSigRequest
