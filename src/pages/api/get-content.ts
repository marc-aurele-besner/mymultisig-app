import { NextApiRequest, NextApiResponse } from 'next'
import { providers, Wallet } from 'ethers'

import { getSql } from '../../lib/db/neon'
import { rowToMultiSigRequestDB } from '../../lib/db/mappers'
import signData from '../../utils/signData'

if (!process.env.DATABASE_URL) throw new Error('No DATABASE_URL in .env file')
if (!process.env.PRIVATE_KEY) throw new Error('No PRIVATE_KEY in .env file')
if (!process.env.RPC_ETHEREUM) throw new Error('No RPC_ETHEREUM in .env file')
if (!process.env.SLACK_TOKEN) throw new Error('No SLACK_TOKEN in .env file')
if (!process.env.SLACK_CONVERSATION_ID) throw new Error('No SLACK_CONVERSATION_ID in .env file')

const FUNCTION = 'get-content'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Function `%s` invoked', FUNCTION)
  const data = JSON.parse(req.body)
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

    switch (data.action) {
      case 'getMultiSigRequests': {
        const rows = (await sql`
          SELECT * FROM multisig_requests
          WHERE multi_sig_address = ${data.data.multiSigAddress}
            AND is_active = true
        `) as Record<string, unknown>[]
        const content = rows.map(rowToMultiSigRequestDB)
        return res.status(200).json({
          message: 'Data retrieved',
          content
        })
      }
      case 'getMultiSigRequestById': {
        const arr = (await sql`
          SELECT * FROM multisig_requests
          WHERE id = ${data.data.multiSigRequestId}
        `) as Record<string, unknown>[]
        if (arr.length === 0) {
          return res.status(404).json({ message: 'Data not found' })
        }
        const content = [rowToMultiSigRequestDB(arr[0])]
        return res.status(200).json({
          message: 'Data retrieved',
          content
        })
      }
      case 'getAddressBook': {
        // All chains at once so a network switch client-side needs no refetch.
        const rows = (await sql`
          SELECT id, chain_id, address, label, kind FROM address_book
          WHERE LOWER(owner_address) = LOWER(${data.data.ownerAddress})
        `) as Record<string, unknown>[]
        const content = rows.map((row) => ({
          id: String(row.id),
          chainId: Number(row.chain_id),
          address: String(row.address),
          label: String(row.label),
          kind: String(row.kind)
        }))
        return res.status(200).json({
          message: 'Data retrieved',
          content
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
