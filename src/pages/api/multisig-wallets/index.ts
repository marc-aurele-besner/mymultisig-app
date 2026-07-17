import { NextApiRequest, NextApiResponse } from 'next'

import { getSql } from '../../../lib/db/neon'
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
  const sql = getSql()
  const doc = parseBody(req) as Record<string, unknown>
  const existing = (await sql`
    SELECT id FROM multisig_wallets
    WHERE chain_id = ${doc.chainId} AND LOWER(address) = LOWER(${doc.address})
    LIMIT 1
  `) as { id: number }[]
  if (existing.length > 0) {
    await sql`
      UPDATE multisig_wallets SET
        threshold = ${doc.threshold},
        owner_count = ${doc.ownerCount},
        nonce = ${doc.nonce ?? 0},
        owners = ${JSON.stringify(doc.owners ?? [])},
        wallet_type = ${doc.walletType ?? 'simple'},
        allow_only_owner_request = ${doc.allowOnlyOwnerRequest ?? false}
      WHERE id = ${existing[0].id}
    `
    console.log('Add content done (updated existing wallet)')
    return res.status(200).json({ message: 'Add content done (updated existing wallet)' })
  }
  await sql`
    INSERT INTO multisig_wallets (
      chain_id, chain_name, factory_address, contract_id, name, version,
      address, threshold, owner_count, nonce, owners, is_deployed,
      wallet_type, allow_only_owner_request
    ) VALUES (
      ${doc.chainId},
      ${doc.chainName},
      ${doc.factoryAddress},
      ${doc.id},
      ${doc.name},
      ${doc.version},
      ${doc.address},
      ${doc.threshold},
      ${doc.ownerCount},
      ${doc.nonce ?? 0},
      ${JSON.stringify(doc.owners ?? [])},
      ${doc.isDeployed ?? true},
      ${doc.walletType ?? 'simple'},
      ${doc.allowOnlyOwnerRequest ?? false}
    )
  `
  console.log('Add content done')
  return res.status(200).json({ message: 'Add content done' })
})

const patchHandler = withSession(async (req, res) => {
  const sql = getSql()
  const doc = parseBody(req) as Record<string, unknown>
  if (!doc.address || doc.chainId === undefined) {
    return res.status(400).json({ message: 'Missing wallet address or chainId' })
  }
  const rows = (await sql`
    SELECT * FROM multisig_wallets
    WHERE LOWER(address) = LOWER(${doc.address}) AND chain_id = ${doc.chainId}
    ORDER BY id DESC LIMIT 1
  `) as Record<string, unknown>[]
  if (rows.length === 0) {
    return res.status(400).json({ message: 'Unknown wallet' })
  }
  const existing = rows[0]
  await sql`
    UPDATE multisig_wallets SET
      threshold = ${doc.threshold ?? existing.threshold},
      owner_count = ${doc.ownerCount ?? existing.owner_count},
      nonce = ${doc.nonce ?? existing.nonce},
      owners = ${JSON.stringify(doc.owners ?? existing.owners ?? [])},
      wallet_type = ${doc.walletType ?? existing.wallet_type},
      allow_only_owner_request = ${doc.allowOnlyOwnerRequest ?? existing.allow_only_owner_request}
    WHERE id = ${existing.id}
  `
  console.log('Update wallet done')
  return res.status(200).json({ message: 'Update wallet done' })
})

const listHandler = withVerifiedAs(
  (req) => parseQueryString(req).ownerAddress,
  async (req, res) => {
    const sql = getSql()
    const ownerAddress = parseQueryString(req).ownerAddress
    const rows = (await sql`
      SELECT * FROM multisig_wallets
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(owners) AS o
        WHERE LOWER(o) = LOWER(${ownerAddress})
      )
    `) as Record<string, unknown>[]
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
