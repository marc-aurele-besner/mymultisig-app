import { NextApiRequest, NextApiResponse } from 'next'
import { providers, Wallet } from 'ethers'
import fauna from 'faunadb-utility'
import { slackBuilder, slackUtils } from 'slack-utility'
import { TBlock } from 'slack-utility/src/types'
import { v4 as uuid } from 'uuid'

import signData from '../../utils/signData'

if (!process.env.FAUNADB_SERVER_SECRET) throw new Error('No FAUNADB_SERVER_SECRET in .env file')
if (!process.env.PRIVATE_KEY) throw new Error('No PRIVATE_KEY in .env file')
if (!process.env.RPC_ETHEREUM) throw new Error('No RPC_ETHEREUM in .env file')
if (!process.env.SLACK_TOKEN) throw new Error('No SLACK_TOKEN in .env file')
if (!process.env.SLACK_CONVERSATION_ID) throw new Error('No SLACK_CONVERSATION_ID in .env file')

const { FAUNADB_SERVER_SECRET, SLACK_TOKEN, SLACK_CONVERSATION_ID } = process.env

const FUNCTION = 'add-content'

// eslint-disable-next-line
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
    console.log(`Function '${FUNCTION}" invoked`, data)

    if (process.env.SLACK_TOKEN && process.env.SLACK_CONVERSATION_ID)
      await slackUtils.slackPostMessage(
        process.env.SLACK_TOKEN,
        process.env.SLACK_CONVERSATION_ID,
        'Add Content function called',
        [slackBuilder.buildSimpleSlackHeaderMsg(`Someone is adding data on MyMultiSig.app (${data.action})`)],
        true
      )

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
      res.status(400).json({
        message: 'Signature does not match'
      })
    }
    /**
     * To-Do: Check the user signature
     */
    let classes: string[] = []
    let slackMessageTitle = ''
    let slackMessageBlocks: TBlock[] = []
    console.log('data.collection', data.action)
    switch (data.action) {
      case 'addMultiSigRequest':
        classes = ['multisig-requests']
        slackMessageTitle = 'A new MultiSig request has been created'
        slackMessageBlocks = [slackBuilder.buildSimpleSlackHeaderMsg(`A new MultiSig request has been created`)]
        break
      case 'createMultiSigWallet':
        classes = ['multisig-wallets']
        ;(slackMessageTitle = 'New MultiSig wallet was created'),
          (slackMessageBlocks = [slackBuilder.buildSimpleSlackHeaderMsg(`New MultiSig wallet was created`)])
        break
      default:
        break
    }
    if (slackMessageTitle && slackMessageBlocks && slackMessageBlocks.length > 0) {
      await slackUtils.slackPostMessage(SLACK_TOKEN, SLACK_CONVERSATION_ID, slackMessageTitle, slackMessageBlocks, true)
    }
    console.log('classes', classes)
    if (classes.length == 1) {
      await fauna.createFaunaDocument(FAUNADB_SERVER_SECRET, classes[0], {
        id: uuid(),
        ...data.data
      })
      console.log('Add content done')
      res.status(200).json({
        message: 'Add content done'
      })
    } else {
      console.log('Invalid collection')
      res.status(400).json({
        message: 'Invalid collection'
      })
    }
  } else {
    console.log('Invalid data')
    res.status(400).json({
      message: JSON.stringify('Invalid data')
    })
  }
}

export default handler
