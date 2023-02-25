import { NextApiRequest, NextApiResponse } from 'next'
import { providers, Wallet } from 'ethers'

import signData from '../../utils/signData'

if (!process.env.PRIVATE_KEY) throw new Error('No PRIVATE_KEY in .env file')
if (!process.env.RPC_ETHEREUM) throw new Error('No RPC_ETHEREUM in .env file')

const FUNCTION = 'sign-data'

// eslint-disable-next-line
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Function `%s` invoked', FUNCTION)
  const data = JSON.parse(req.body)
  try {
    console.log('process.env.PRIVATE_KEY', process.env.PRIVATE_KEY)
    console.log('process.env.RPC_ETHEREUM', process.env.RPC_ETHEREUM)
    if (
      process.env.PRIVATE_KEY !== undefined &&
      process.env.RPC_ETHEREUM !== undefined &&
      data.action !== undefined &&
      data.chainId !== undefined &&
      data.collection !== undefined &&
      data.data !== undefined &&
      data.details !== undefined &&
      data.signatureExpiry !== undefined
    ) {
      console.log(`Function '${FUNCTION}" invoked`)

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
      if (matchingUISignData.signature !== data.signature || matchingUISignData.signer !== data.signer) {
        console.log('Sign content done')
        res.status(200).json({
          message: matchingUISignData
        })
      } else {
        console.log('Invalid data')
        res.status(400).json({
          message: JSON.stringify('Invalid data')
        })
      }
    } else {
      console.log('Invalid data')
      res.status(400).json({
        message: JSON.stringify('Invalid data')
      })
    }
  } catch (error) {
    console.log('Error', error)
    res.status(400).json({
      message: JSON.stringify(error)
    })
  }
}

export default handler
