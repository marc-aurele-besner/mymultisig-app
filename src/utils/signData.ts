import { JsonRpcProvider, Wallet } from 'ethersV6'

import { TCollectionList } from '../models/Collections'
import { TApiCallData } from '../types/signedData'

const signDataForApi = async (
  pk: string,
  rpcUrl: string,
  action: string,
  chainId: number,
  collection: TCollectionList,
  // eslint-disable-next-line
  data: any,
  details: string,
  signatureExpiry = 0
) => {
  const uiProvider = new JsonRpcProvider(rpcUrl)
  const uiSigner = new Wallet(pk, uiProvider)

  const currentBlockNumber = await uiProvider.getBlockNumber()
  if (signatureExpiry === 0) signatureExpiry = currentBlockNumber + 300 - 1
  // eslint-disable-next-line
  const message: any = [
    {
      name: 'blockchainList',
      version: '0.1',
      chainId: chainId,
      verifyingContract: '0x0000000000000000000000000000000000000000'
    },
    {
      validateAction: [
        {
          name: 'action',
          type: 'string'
        },
        {
          name: 'details',
          type: 'string'
        },
        {
          name: 'dbRef',
          type: 'string'
        },
        {
          name: 'signatureExpiry',
          type: 'uint256'
        }
      ]
    },
    {
      action,
      details,
      dbRef: JSON.stringify({
        collection,
        data
      }),
      signatureExpiry
    }
  ]
  // eslint-disable-next-line
  const signature = await uiSigner.signTypedData(message[0], message[1], message[2])
  // eslint-disable-next-line
  const fullData: TApiCallData = {
    collection,
    action,
    chainId,
    details,
    message,
    data,
    signer: uiSigner.address,
    signature,
    signatureExpiry
  }
  return fullData
}

export default signDataForApi
