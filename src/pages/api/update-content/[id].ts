import { NextApiRequest, NextApiResponse } from 'next'
import { providers, Wallet } from 'ethers'

import { getSql } from '../../../lib/db/neon'
import { rowToMultiSigRequestDB } from '../../../lib/db/mappers'
import signData from '../../../utils/signData'

if (!process.env.DATABASE_URL) throw new Error('No DATABASE_URL in .env file')
if (!process.env.PRIVATE_KEY) throw new Error('No PRIVATE_KEY in .env file')
if (!process.env.RPC_ETHEREUM) throw new Error('No RPC_ETHEREUM in .env file')
if (!process.env.SLACK_TOKEN) throw new Error('No SLACK_TOKEN in .env file')
if (!process.env.SLACK_CONVERSATION_ID) throw new Error('No SLACK_CONVERSATION_ID in .env file')

const FUNCTION = 'update-content'

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

    switch (data.action) {
      case 'updateMultiSigRequest':
      case 'resetMultiSigRequest': {
        const rows = (await sql`
          SELECT * FROM multisig_requests WHERE id = ${id}
        `) as Record<string, unknown>[]
        if (rows.length === 0) {
          return res.status(400).json({ message: 'Invalid document id' })
        }
        const existing = rows[0]
        const patch = data.data as Record<string, unknown>
        const request = patch.request ?? existing.request
        const signatures = patch.signatures ?? existing.signatures ?? []
        const ownerSigners = patch.ownerSigners ?? existing.owner_signers ?? []
        const dateExecuted = patch.dateExecuted ?? existing.date_executed ?? ''
        const isExecuted = patch.isExecuted ?? existing.is_executed ?? false
        const isSuccessful = patch.isSuccessful ?? patch.isSuccess ?? existing.is_successful ?? false

        await sql`
          UPDATE multisig_requests SET
            request = ${JSON.stringify(request)},
            signatures = ${JSON.stringify(signatures)},
            owner_signers = ${JSON.stringify(ownerSigners)},
            date_executed = ${dateExecuted},
            is_executed = ${isExecuted},
            is_successful = ${isSuccessful}
          WHERE id = ${id}
        `
        const updated = (await sql`
          SELECT * FROM multisig_requests WHERE id = ${id}
        `) as Record<string, unknown>[]
        return res.status(200).json({
          message: 'Data updated',
          content: rowToMultiSigRequestDB(updated[0]).data
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
