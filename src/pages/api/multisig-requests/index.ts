import { and, desc, eq, sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { getDb } from '../../../lib/db/neon'
import { multisigRequests, multisigWallets } from '../../../lib/db/schema'
import { rowToMultiSigRequest } from '../../../lib/db/mappers'
import { parseBody, parseQueryString, withSession, withVerifiedAs } from '../../../lib/api/middleware'

// Dedicated endpoints for multisig transaction requests:
//   POST /api/multisig-requests         addMultiSigRequest
//   GET  /api/multisig-requests?…       getMultiSigRequests   (public read)
//
// `addMultiSigRequest` requires the SIWE session to match the body-claimed
// `submitter`. The 403 for `allow_only_owner_request` (extended wallets that
// only accept requests from their owners) lives inside the handler because it
// needs a fresh wallet row.
const createHandler = withVerifiedAs(
  (req) => (parseBody(req) as { submitter?: string }).submitter,
  async (req, res) => {
    const db = getDb()
    const body = parseBody(req) as Record<string, unknown>
    const doc: Record<string, unknown> = { ...body }

    const wallets = await db
      .select({ allowOnlyOwnerRequest: multisigWallets.allowOnlyOwnerRequest, owners: multisigWallets.owners })
      .from(multisigWallets)
      .where(sql`LOWER(${multisigWallets.address}) = LOWER(${String(doc.multiSigAddress)})`)
      .orderBy(desc(multisigWallets.id))
      .limit(1)
    if (wallets.length > 0 && wallets[0].allowOnlyOwnerRequest) {
      const owners = (wallets[0].owners ?? []).map((o: string) => o.toLowerCase())
      if (owners.length > 0 && !owners.includes(String(doc.submitter ?? '').toLowerCase())) {
        return res.status(403).json({ message: 'This wallet only accepts requests from its owners' })
      }
    }

    await db.insert(multisigRequests).values({
      multiSigAddress: String(doc.multiSigAddress),
      request: doc.request as Record<string, unknown>,
      description: String(doc.description),
      submitter: String(doc.submitter),
      signatures: (doc.signatures as string[]) ?? [],
      ownerSigners: (doc.ownerSigners as string[]) ?? [],
      dateSubmitted: String(doc.dateSubmitted),
      dateExecuted: (doc.dateExecuted as string) ?? '',
      isActive: (doc.isActive as boolean) ?? true,
      isExecuted: (doc.isExecuted as boolean) ?? false,
      isCancelled: (doc.isCancelled as boolean) ?? false,
      isConfirmed: (doc.isConfirmed as boolean) ?? false,
      isSuccessful: (doc.isSuccessful as boolean) ?? false
    })
    console.log('Add request done')
    return res.status(200).json({ message: 'Add request done' })
  }
)

const listHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { multiSigAddress } = parseQueryString(req)
  if (multiSigAddress === '') {
    return res.status(400).json({ message: 'Missing multiSigAddress' })
  }
  const db = getDb()
  const rows = await db
    .select()
    .from(multisigRequests)
    .where(and(eq(multisigRequests.multiSigAddress, multiSigAddress), eq(multisigRequests.isActive, true)))
  return res.status(200).json({
    message: 'Data retrieved',
    content: rows.map(rowToMultiSigRequest)
  })
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') return listHandler(req, res)
  if (req.method === 'POST') return createHandler(req, res)
  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ message: 'Method not allowed' })
}

export default handler
