import { useEffect, useState } from 'react'
import { useAccount, useChainId, useChains, useSignTypedData } from 'wagmi'
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
  existingRequestId?: string
) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find(c => c.id === chainId)
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

  const valueCheck = isNumber(args.value)
  const gasCheck = isNumber(args.txnGas)

  const valueAndGasCheck = valueCheck && gasCheck ? true : false

  const value = {
    to: args.to,
    value: valueCheck ? BigInt(args.value) : BigInt(0),
    data: args.data,
    gas: gasCheck ? BigInt(args.txnGas) : BigInt(0),
    // Requests pinned to an explicit nonce (Extended wallets) must be signed
    // against that nonce; everything else signs the wallet's current nonce.
    nonce:
      args.txnNonce != null && args.txnNonce !== ''
        ? BigInt(args.txnNonce)
        : BigInt(multiSigDetails?.[4] != null ? String(multiSigDetails[4]) : 0)
  } as const

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
      if (existingRequest && existingRequestId)
        signData({
          action: 'updateMultiSigRequest',
          chainId: chain.id,
          collection: 'multisig-requests',
          data: dataToAdd,
          details: 'Update MultiSig Request',
          signatureExpiry: 0
        }).then(async (dataSigned) => {
          updateContent(dataSigned.message, existingRequestId).then(() => {
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
    isPending,
    isSuccess,
    prepareError: !valueAndGasCheck ? null : 'Invalid value or gas',
    error,
    signTypedData: () => signTypedData({ domain, types, primaryType: 'Transaction', message: value }),
    reset
  }
}

export default useSignedMultiSigRequest
