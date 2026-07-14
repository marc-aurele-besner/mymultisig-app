import { NextApiRequest, NextApiResponse } from 'next'
import { providers, Wallet } from 'ethers'

import { getSql } from '../../../lib/db/neon'
import { getVerifiedAddress } from '../../../lib/auth/siwe'
import signData from '../../../utils/signData'

if (!process.env.DATABASE_URL) throw new Error('No DATABASE_URL in .env file')
if (!process.env.PRIVATE_KEY) throw new Error('No PRIVATE_KEY in .env file')
if (!process.env.RPC_ETHEREUM) throw new Error('No RPC_ETHEREUM in .env file')
if (!process.env.SLACK_TOKEN) throw new Error('No SLACK_TOKEN in .env file')
if (!process.env.SLACK_CONVERSATION_ID) throw new Error('No SLACK_CONVERSATION_ID in .env file')

const FUNCTION = 'delete-content'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Function `%s` invoked', FUNCTION)
  const data = JSON.parse(req.body)
  const { id } = req.query
  if (!id) throw new Error('No id in query')
  if (typeof id !== 'string') throw new Error('id is not a string')

  if (
    process.env.PRIVATE_KEY !== undefined &&
    process.env.RPC_ETHEREUM !== undefined &&
    data.collection !== undefined &&
    data.action !== undefined &&
    data.chainId !== undefined &&
    data.details !== undefined &&
    data.message !== undefined &&
    data.data !== undefined &&
    data.signer !== undefined &&
    data.signature !== undefined &&
    data.signatureExpiry !== undefined
  ) {
    const matchingUISignData = await signData(
      process.env.PRIVATE_KEY,
      process.env.RPC_ETHEREUM,
      data.action,
      data.chainId,
      data.collection,
      data.data,
      data.details,
      data.signatureExpiry
    )
    const uiProvider = new providers.JsonRpcProvider(process.env.RPC_ETHEREUM)
    const uiPK = process.env.PRIVATE_KEY
    if (uiPK === undefined) throw new Error('No PRIVATE_KEY in .env.development file')
    const uiSigner = new Wallet(uiPK, uiProvider)
    const matchingUISignDataCheck2 = await uiSigner._signTypedData(data.message[0], data.message[1], data.message[2])
    if (
      matchingUISignData.signature !== data.signature ||
      matchingUISignData.signer !== data.signer ||
      matchingUISignData.signature !== matchingUISignDataCheck2
    ) {
      console.log('Signature mismatch')
      return res.status(400).json({
        message: 'Signature does not match'
      })
    }

    const sql = getSql()

    if (getVerifiedAddress(req) == null) {
      return res.status(401).json({ message: 'Wallet not verified: sign in with your wallet first' })
    }

    switch (data.action) {
      case 'deleteMultiSigRequest': {
        // Use document id (UUID) from URL - client passes requestDetails.data.id
        await sql`DELETE FROM multisig_requests WHERE id = ${id}`
        return res.status(200).json({
          message: 'Data retrieved',
          content: 'Ref deleted'
        })
      }
      default:
        return res.status(400).json({ message: 'Invalid collection' })
    }
  } else {
    console.log('Invalid data')
    return res.status(400).json({
      message: 'Invalid data'
    })
  }
}

export default handler
