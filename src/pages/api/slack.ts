// Placeholder for the retired slack-utility bot integration. The endpoint is
// kept so existing Slack webhooks get a clean 200 instead of a 404; the bot
// logic (and its legacy document-store backend) was removed with the move to Neon.
import { NextApiRequest, NextApiResponse } from 'next'

const FUNCTION = 'slack'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Function `%s` invoked', FUNCTION)
  return res.status(200).json({ message: 'Slack integration is disabled' })
}

export default handler
