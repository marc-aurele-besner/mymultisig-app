import { providers, Wallet } from 'ethers'
import fauna from 'faunadb-utility'
import { slackBuilder, slackUtils } from 'slack-utility'
import { TBlock } from 'slack-utility/src/types'
import { v4 as uuid } from 'uuid'

import signDataForApi from '../../hooks/shared/signDataForApi'

if (!process.env.FAUNADB_SERVER_SECRET) throw new Error('No FAUNADB_SERVER_SECRET in .env file')
if (!process.env.API_SIGNER_PRIVATE_KEY) throw new Error('No API_SIGNER_PRIVATE_KEY in .env file')
if (!process.env.API_SIGNER_RPC_URL) throw new Error('No API_SIGNER_RPC_URL in .env file')
if (!process.env.SLACK_TOKEN) throw new Error('No SLACK_TOKEN in .env file')
if (!process.env.SLACK_CONVERSATION_ID) throw new Error('No SLACK_CONVERSATION_ID in .env file')

const { FAUNADB_SERVER_SECRET, SLACK_TOKEN, SLACK_CONVERSATION_ID } = process.env

const FUNCTION = 'add-content'

// eslint-disable-next-line
const handler = async (event: any, context: any) => {
  console.log('Function `%s` invoked', FUNCTION)
  const data = JSON.parse(event.body)
  if (
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

    const matchingUISignData = await signDataForApi(
      data.action,
      data.chainId,
      data.collection,
      data.data,
      data.details,
      data.signatureExpiry
    )
    const uiProvider = new providers.JsonRpcProvider(process.env.API_SIGNER_RPC_URL)
    const uiPK = process.env.API_SIGNER_PRIVATE_KEY
    if (uiPK === undefined) throw new Error('No API_SIGNER_PRIVATE_KEY in .env file')
    const uiSigner = new Wallet(uiPK, uiProvider)
    const matchingUISignDataCheck2 = await uiSigner._signTypedData(data.message[0], data.message[1], data.message[2])
    if (
      matchingUISignData.signature !== data.signature ||
      matchingUISignData.signer !== data.signer ||
      matchingUISignData.signature !== matchingUISignDataCheck2
    ) {
      console.log('Signature mismatch')
      context.res = {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Signature does not match'
        })
      }
    }
    /**
     * To-Do: Check the user signature
     */
    let classes: string[] = []
    let slackMessageTitle = ''
    let slackMessageBlocks: TBlock[] = []
    switch (data.collection) {
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
    if (classes.length == 1) {
      await fauna.createFaunaDocument(FAUNADB_SERVER_SECRET, classes[0], {
        id: uuid(),
        ...data.data
      })
      console.log('Add content done')
    } else console.log('Invalid collection')
    context.res = {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Invalid collection'
      })
    }
  } else {
    console.log('Invalid data')
    context.res = {
      statusCode: 400,
      body: JSON.stringify('Invalid data')
    }
  }
}

export default handler
