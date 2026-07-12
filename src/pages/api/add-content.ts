import { NextApiRequest, NextApiResponse } from 'next'
import { providers, Wallet } from 'ethers'
import { v4 as uuid } from 'uuid'

import { getSql } from '../../lib/db/neon'
import signData from '../../utils/signData'

if (!process.env.DATABASE_URL) throw new Error('No DATABASE_URL in .env file')
if (!process.env.PRIVATE_KEY) throw new Error('No PRIVATE_KEY in .env file')
if (!process.env.RPC_ETHEREUM) throw new Error('No RPC_ETHEREUM in .env file')
if (!process.env.SLACK_TOKEN) throw new Error('No SLACK_TOKEN in .env file')
if (!process.env.SLACK_CONVERSATION_ID) throw new Error('No SLACK_CONVERSATION_ID in .env file')

const FUNCTION = 'add-content'

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
    if (uiPK === undefined) throw new Error('No PRIVATE_KEY in .env file')
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
      case 'addMultiSigRequest': {
        const doc = { id: uuid(), ...data.data }
        await sql`
          INSERT INTO multisig_requests (
            id, multi_sig_address, request, description, submitter,
            signatures, owner_signers, date_submitted, date_executed,
            is_active, is_executed, is_cancelled, is_confirmed, is_successful
          ) VALUES (
            ${doc.id},
            ${doc.multiSigAddress},
            ${JSON.stringify(doc.request)},
            ${doc.description},
            ${doc.submitter},
            ${JSON.stringify(doc.signatures ?? [])},
            ${JSON.stringify(doc.ownerSigners ?? [])},
            ${doc.dateSubmitted},
            ${doc.dateExecuted ?? ''},
            ${doc.isActive ?? true},
            ${doc.isExecuted ?? false},
            ${doc.isCancelled ?? false},
            ${doc.isConfirmed ?? false},
            ${doc.isSuccessful ?? false}
          )
        `
        console.log('Add content done')
        return res.status(200).json({ message: 'Add content done' })
      }
      case 'createMultiSigWallet': {
        const doc = data.data
        await sql`
          INSERT INTO multisig_wallets (
            chain_id, chain_name, factory_address, contract_id, name, version,
            address, threshold, owner_count, nonce, owners, is_deployed,
            wallet_type, allow_only_owner_request
          ) VALUES (
            ${doc.chainId},
            ${doc.chainName},
            ${doc.factoryAddress},
            ${doc.id},
            ${doc.name},
            ${doc.version},
            ${doc.address},
            ${doc.threshold},
            ${doc.ownerCount},
            ${doc.nonce ?? 0},
            ${JSON.stringify(doc.owners ?? [])},
            ${doc.isDeployed ?? true},
            ${doc.walletType ?? 'simple'},
            ${doc.allowOnlyOwnerRequest ?? false}
          )
        `
        console.log('Add content done')
        return res.status(200).json({ message: 'Add content done' })
      }
      default:
        return res.status(400).json({ message: 'Invalid collection' })
    }
  } else {
    console.log('Invalid data')
    return res.status(400).json({
      message: JSON.stringify('Invalid data')
    })
  }
}

export default handler
