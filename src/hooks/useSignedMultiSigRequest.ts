import { useContractRead, useNetwork, useSignTypedData } from 'wagmi'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'
import { BigNumber } from 'ethers'

import { useNotificationSuccess, useNotificationError } from './notifications'
import { MultiSigExecTransactionArgs } from '../models/MultiSigs'

const useSignedMultiSigRequest = (multiSigAddress: `0x${string}`, args: MultiSigExecTransactionArgs) => {
  const { chain } = useNetwork()
  const notificationError = useNotificationError(
    'Error Signing MultiSig Request',
    'There was an error signing MultiSig request.'
  )
  const notificationSuccess = useNotificationSuccess(
    'Successfully Signing MultiSig Request',
    'You signed the MultiSig request successfully.'
  )

  const { data: nonceData } = useContractRead({
    address: multiSigAddress,
    abi: MyMultiSig,
    functionName: 'nonce'
  })

  const domain = {
    name: 'MyMultiSigFactory',
    version: '0.0.7',
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
    nonce: BigNumber.from(nonceData)
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

  return { data, isError, isLoading, isSuccess, signTypedData }
}

export default useSignedMultiSigRequest
