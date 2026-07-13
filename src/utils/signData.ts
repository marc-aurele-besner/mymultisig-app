import { providers, Wallet } from 'ethers'

import { TCollectionList } from '../models/Collections'
import { TApiCallData } from '../types/signedData'

const signDataForApi = async (
  pk: string,
  rpcUrl: string,
  action: string,
  chainId: number,
  collection: TCollectionList,
   
  data: any,
  details: string,
  signatureExpiry = 0
) => {
  const uiProvider = new providers.JsonRpcProvider(rpcUrl)
  const uiSigner = new Wallet(pk, uiProvider)

  const currentBlockNumber = await uiProvider.getBlockNumber()
  if (signatureExpiry === 0) signatureExpiry = currentBlockNumber + 300 - 1
   
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
   
  const signature = await uiSigner._signTypedData(message[0], message[1], message[2])
   
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
