import { NextApiRequest, NextApiResponse } from 'next'

import { VersionInfo, parseMessageKey, resolveForceBefore } from '../../lib/app-version/policy'

const FUNCTION = 'build-id'

// NEXT_PUBLIC_* values are inlined at build time, so this answers with the
// build that is actually serving. FORCE_REFRESH_BEFORE and FORCE_REFRESH_MESSAGE
// are read at runtime: they change what open tabs are told without a rebuild.
const handler = (req: NextApiRequest, res: NextApiResponse<VersionInfo | { error: string }>) => {
  console.info('Function `%s` invoked', FUNCTION)
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const info: VersionInfo = {
    buildId: process.env.NEXT_PUBLIC_BUILD_ID || 'dev',
    builtAt: Number(process.env.NEXT_PUBLIC_BUILT_AT) || 0,
    forceBefore: resolveForceBefore(process.env.FORCE_REFRESH_BEFORE),
    message: parseMessageKey(process.env.FORCE_REFRESH_MESSAGE)
  }

  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json(info)
}

export default handler
