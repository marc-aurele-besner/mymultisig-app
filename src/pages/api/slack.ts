import { slackUtils } from 'slack-utility'
import MyMultiSigFactory from 'mymultisig-contract/abi/MyMultiSigFactory.json'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'

import actionsList from '../../slackActions'
import multiSigFactories from '../../constants/multiSigFactory'

if (!process.env.FAUNADB_SERVER_SECRET) throw new Error('No FAUNADB_SERVER_SECRET in .env file')
if (!process.env.SLACK_TOKEN) throw new Error('No SLACK_TOKEN in .env file')
if (!process.env.SLACK_CONVERSATION_ID) throw new Error('No SLACK_CONVERSATION_ID in .env file')
if (!process.env.PRIVATE_KEY) throw new Error('No PRIVATE_KEY in .env file')
if (!process.env.RPC_ETHEREUM) throw new Error('No RPC_ETHEREUM in .env file')

const { FAUNADB_SERVER_SECRET, SLACK_TOKEN, SLACK_CONVERSATION_ID, PRIVATE_KEY, RPC_ETHEREUM } = process.env

const FUNCTION = 'slack'

// eslint-disable-next-line
const handler = async (event: any, context: any) => {
  console.log('Function `%s` invoked', FUNCTION)

  try {
    context.res = await slackUtils.slackEndpoint(
      event,
      {
        contracts: [
          {
            name: 'MyMultiSigFactory',
            emoji: ':lock:',
            active: true,
            addressPerNetwork: multiSigFactories.map((factory) => {
              return {
                network: factory.chainName,
                address: factory.address,
                abiName: 'MyMultiSigFactory'
              }
            })
          }
        ],
        networks: [
          {
            name: 'Localhost (development)',
            value: 'localhost',
            defaultRpc: `http://localhost:8545`,
            chainId: 31337,
            emoji: ':large_green_circle: 🏠',
            active: true,
            signingType: 'web3'
          }
        ],
        commands: [
          {
            command: 'settings',
            description: 'Bot settings',
            actionId: 'settings',
            active: true
          },
          {
            command: 'balance',
            description: 'Bot wallets balance',
            actionId: 'balance',
            active: false
          }
        ],
        signerPrivateKey: PRIVATE_KEY
      },
      SLACK_TOKEN,
      {
        db: 'fauna',
        token: FAUNADB_SERVER_SECRET
      },
      SLACK_CONVERSATION_ID,
      'https://mymultisig.app/',
      actionsList,
      RPC_ETHEREUM,
      {
        MyMultiSigFactory: MyMultiSigFactory,
        MyMultiSig: MyMultiSig
      },
      {
        useDapp: true,
        useModules: true,
        useAppForSigner: true,
        allowTeamSettings: true,
        allowUserSettings: true,
        dbType: 'faunaDB',
        logLevel: 1,
        addDeleteButtons: true,
        addSettingsButton: true,
        addRefreshButton: false,
        addNetworkAndContractSelector: true,
        useExplorerModule: true,
        useAddressBookModule: true
      }
    )
  } catch (error) {
    context.res = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Error'
      })
    }
  }
}

export default handler
