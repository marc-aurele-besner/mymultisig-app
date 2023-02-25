import { NextApiRequest, NextApiResponse } from 'next'

import signData from '../../utils/signData'

if (!process.env.PRIVATE_KEY) throw new Error('No PRIVATE_KEY in .env file')
if (!process.env.RPC_ETHEREUM) throw new Error('No RPC_ETHEREUM in .env file')

const FUNCTION = 'sign-data'

// eslint-disable-next-line
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.info('Function `%s` invoked', FUNCTION)
  const data = JSON.parse(req.body)
  try {
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
        res.status(200).json({
          message: matchingUISignData
        })
      } else {
        res.status(400).json({
          message: JSON.stringify('Invalid data')
        })
      }
    } else {
      res.status(400).json({
        message: JSON.stringify('Invalid data')
      })
    }
  } catch (error) {
    res.status(400).json({
      message: JSON.stringify(error)
    })
  }
}

export default handler
