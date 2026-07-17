import { and, desc, eq, sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { getDb } from '../../../lib/db/neon'
import { multisigWallets } from '../../../lib/db/schema'
import { rowToMultiSig } from '../../../lib/db/mappers'
import { parseBody, parseQueryString, withSession, withVerifiedAs } from '../../../lib/api/middleware'

// /api/multisig-wallets hosts three actions on one path:
//   POST   createMultiSigWallet  (idempotent upsert on (chainId, address))
//   PATCH  updateMultiSigWallet  (partial update of an existing wallet)
//   GET    getMultiSigWallets    (every wallet where the verified owner is on)
//
// The two writes have distinct shapes (POST = upsert, PATCH = partial patch)
// — splitting them on the HTTP verb keeps the URL flat while staying honest
// about the payload each call expects.

const upsertHandler = withSession(async (req, res) => {
  const db = getDb()
  const doc = parseBody(req) as Record<string, unknown>
  const existing = await db
    .select({ id: multisigWallets.id })
    .from(multisigWallets)
    .where(and(eq(multisigWallets.chainId, Number(doc.chainId)), sql`LOWER(${multisigWallets.address}) = LOWER(${String(doc.address)})`))
    .limit(1)
  const walletPatch = {
    threshold: Number(doc.threshold),
    ownerCount: Number(doc.ownerCount),
    nonce: Number(doc.nonce ?? 0),
    owners: (doc.owners as string[]) ?? [],
    walletType: (doc.walletType as string) ?? 'simple',
    allowOnlyOwnerRequest: Boolean(doc.allowOnlyOwnerRequest ?? false)
  }
  if (existing.length > 0) {
    await db.update(multisigWallets).set(walletPatch).where(eq(multisigWallets.id, existing[0].id))
    console.log('Add content done (updated existing wallet)')
    return res.status(200).json({ message: 'Add content done (updated existing wallet)' })
  }
  await db.insert(multisigWallets).values({
    chainId: Number(doc.chainId),
    chainName: String(doc.chainName),
    factoryAddress: String(doc.factoryAddress),
    contractId: Number(doc.id),
    name: String(doc.name),
    version: String(doc.version),
    address: String(doc.address),
    ...walletPatch,
    isDeployed: Boolean(doc.isDeployed ?? true)
  })
  console.log('Add content done')
  return res.status(200).json({ message: 'Add content done' })
})

const patchHandler = withSession(async (req, res) => {
  const db = getDb()
  const doc = parseBody(req) as Record<string, unknown>
  if (!doc.address || doc.chainId === undefined) {
    return res.status(400).json({ message: 'Missing wallet address or chainId' })
  }
  const rows = await db
    .select()
    .from(multisigWallets)
    .where(and(eq(multisigWallets.chainId, Number(doc.chainId)), sql`LOWER(${multisigWallets.address}) = LOWER(${String(doc.address)})`))
    .orderBy(desc(multisigWallets.id))
    .limit(1)
  if (rows.length === 0) {
    return res.status(400).json({ message: 'Unknown wallet' })
  }
  const existing = rows[0]
  await db
    .update(multisigWallets)
    .set({
      threshold: (doc.threshold as number | undefined) ?? existing.threshold,
      ownerCount: (doc.ownerCount as number | undefined) ?? existing.ownerCount,
      nonce: (doc.nonce as number | undefined) ?? existing.nonce,
      owners: (doc.owners as string[] | undefined) ?? existing.owners ?? [],
      walletType: (doc.walletType as string | undefined) ?? existing.walletType,
      allowOnlyOwnerRequest: (doc.allowOnlyOwnerRequest as boolean | undefined) ?? existing.allowOnlyOwnerRequest
    })
    .where(eq(multisigWallets.id, existing.id))
  console.log('Update wallet done')
  return res.status(200).json({ message: 'Update wallet done' })
})

const listHandler = withVerifiedAs(
  (req) => parseQueryString(req).ownerAddress,
  async (req, res) => {
    const db = getDb()
    const ownerAddress = parseQueryString(req).ownerAddress
    const rows = await db
      .select()
      .from(multisigWallets)
      .where(sql`EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(${multisigWallets.owners}) AS o
        WHERE LOWER(o) = LOWER(${ownerAddress})
      )`)
    return res.status(200).json({
      message: 'Data retrieved',
      content: rows.map(rowToMultiSig)
    })
  }
)

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') return upsertHandler(req, res)
  if (req.method === 'PATCH') return patchHandler(req, res)
  if (req.method === 'GET') return listHandler(req, res)
  res.setHeader('Allow', 'GET, POST, PATCH')
  return res.status(405).json({ message: 'Method not allowed' })
}

export default handler
