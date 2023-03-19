import { NextApiRequest, NextApiResponse } from 'next'
import { providers, Wallet } from 'ethers'
import fauna from 'faunadb-utility'
import { slackBuilder, slackUtils } from 'slack-utility'
import { TBlock } from 'slack-utility/src/types'

import signData from '../../../utils/signData'

if (!process.env.FAUNADB_SERVER_SECRET) throw new Error('No FAUNADB_SERVER_SECRET in .env file')
if (!process.env.PRIVATE_KEY) throw new Error('No PRIVATE_KEY in .env file')
if (!process.env.RPC_ETHEREUM) throw new Error('No RPC_ETHEREUM in .env file')
if (!process.env.SLACK_TOKEN) throw new Error('No SLACK_TOKEN in .env file')
if (!process.env.SLACK_CONVERSATION_ID) throw new Error('No SLACK_CONVERSATION_ID in .env file')

const { FAUNADB_SERVER_SECRET, SLACK_TOKEN, SLACK_CONVERSATION_ID } = process.env

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
    if (process.env.SLACK_TOKEN && process.env.SLACK_CONVERSATION_ID)
      await slackUtils.slackPostMessage(
        process.env.SLACK_TOKEN,
        process.env.SLACK_CONVERSATION_ID,
        'Add Content function called',
        [slackBuilder.buildSimpleSlackHeaderMsg(`Someone is updating data on MyMultiSig.app (${data.action})`)],
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
    if (uiPK === undefined) throw new Error('No PRIVATE_KEY in .env.development file')
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
    let indexes: string[] = []
    let slackMessageTitle = ''
    const slackMessageBlocks: TBlock[] = []
    switch (data.action) {
      case 'updateMultiSigRequest':
        classes = ['multisig-requests']
        indexes = ['multisig-requests_by_id']
        slackMessageTitle = 'Someone has signed a request!'
        slackMessageBlocks.push(slackBuilder.buildSimpleSlackHeaderMsg(`Someone has signed a request!`))
        break
      default:
        break
    }
    if (slackMessageTitle && slackMessageBlocks && slackMessageBlocks.length > 0) {
      await slackUtils.slackPostMessage(SLACK_TOKEN, SLACK_CONVERSATION_ID, slackMessageTitle, slackMessageBlocks, true)
    }
    if (classes.length == 1) {
      const previousData = await fauna.queryTermByFaunaIndexes(FAUNADB_SERVER_SECRET, indexes[0], id)

      if (previousData.statusCode == 200 && previousData.body) {
        const foundedData = JSON.parse(previousData.body)
        if (foundedData && foundedData.length == 1) {
          const documentRef = foundedData[0].ref['@ref'].id
          const newData = { ...foundedData[0].data, ...data.data }
          const editData = await fauna.updateFaunaDocument(FAUNADB_SERVER_SECRET, classes[0], documentRef, newData)
          res.status(200).json({
            message: 'Data updated',
            content: JSON.parse(editData.body)
          })
        } else {
          console.log('Invalid document')
          res.status(400).json({
            message: 'Invalid document'
          })
        }
      } else {
        console.log('Invalid document id')
        res.status(400).json({
          message: 'Invalid document id'
        })
      }
    } else {
      console.log('Invalid collection')
      res.status(400).json({
        message: 'Invalid collection'
      })
    }
  } else {
    console.log('Invalid data')
    res.status(400).json({
      message: 'Invalid data'
    })
  }
}

export default handler
