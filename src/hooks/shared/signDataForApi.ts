import { JsonRpcProvider, Wallet } from 'ethersV6'

import { TCollectionList } from '../../models/Collections'
import { TApiCallData } from '../../types/signedData'

const signDataForApi = async (
  action: string,
  chainId: number,
  collection: TCollectionList,
  // eslint-disable-next-line
  data: any,
  details: string,
  signatureExpiry = 0,
) => {
  if (!process.env.NEXT_PUBLIC_SIGNER_PRIVATE_KEY) console.error('No NEXT_PUBLIC_SIGNER_PRIVATE_KEY in .env file')
  if (!process.env.NEXT_PUBLIC_SIGNER_RPC_URL) console.error('No NEXT_PUBLIC_SIGNER_RPC_URL in .env file')

  const uiProvider = new JsonRpcProvider(process.env.NEXT_PUBLIC_SIGNER_RPC_URL)
  const uiPK = process.env.NEXT_PUBLIC_SIGNER_PRIVATE_KEY
  if (uiPK === undefined) throw new Error('No NEXT_SIGNER_PRIVATE_KEY in .env file')
  const uiSigner = new Wallet(uiPK, uiProvider)

  const currentBlockNumber = await uiProvider.getBlockNumber()
  if (signatureExpiry === 0) signatureExpiry = currentBlockNumber + 300 - 1
  // eslint-disable-next-line
  const message: any = [
    {
      name: 'blockchainList',
      version: '0.1',
      chainId: chainId,
      verifyingContract: '0x0000000000000000000000000000000000000000',
    },
    {
      validateAction: [
        {
          name: 'action',
          type: 'string',
        },
        {
          name: 'details',
          type: 'string',
        },
        {
          name: 'dbRef',
          type: 'string',
        },
        {
          name: 'signatureExpiry',
          type: 'uint256',
        },
      ],
    },
    {
      action,
      details,
      dbRef: JSON.stringify({
        collection,
        data,
      }),
      signatureExpiry,
    },
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
    signatureExpiry,
  }
  return fullData
}

export default signDataForApi
