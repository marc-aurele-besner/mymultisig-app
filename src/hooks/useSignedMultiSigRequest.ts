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
  description: string,
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

  const isNumber = (value: string | number): boolean =>
    value != null && value !== '' && !isNaN(Number(value.toString()))

  const valueCheck = BigNumber.isBigNumber(args.value) || isNumber(args.value) ? true : false
  const gasCheck = BigNumber.isBigNumber(args.txnGas) || isNumber(args.txnGas) ? true : false

  const valueAndGasCheck = valueCheck && gasCheck ? true : false

  const value = {
    to: args.to,
    value: valueCheck ? BigNumber.from(args.value) : BigNumber.from(0),
    data: args.data,
    gas: gasCheck ? BigNumber.from(args.txnGas) : BigNumber.from(0),
    nonce: BigNumber.from(multiSigDetails ? multiSigDetails[4] : 0)
  } as const

  const { data, isError, isLoading, isSuccess, error, signTypedData, reset } = useSignTypedData({
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
    if (isSuccess && data && chain && !dataAdded) {
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
    isLoading,
    isSuccess,
    prepareError: !valueAndGasCheck ? null : 'Invalid value or gas',
    error,
    signTypedData,
    reset
  }
}

export default useSignedMultiSigRequest
