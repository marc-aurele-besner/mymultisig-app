import { NextApiRequest, NextApiResponse } from 'next'

const FUNCTION = 'health'

// Liveness probe for the uptime monitor. It answers without touching Neon or
// any other upstream, so a failure here means the app itself is not serving,
// and a slow response points at a cold start rather than an outage.
const handler = (req: NextApiRequest, res: NextApiResponse<{ status: 'ok' } | { error: string }>) => {
  console.info('Function `%s` invoked', FUNCTION)
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ status: 'ok' })
}

export default handler
