import { NextApiRequest, NextApiResponse } from 'next'

import { getSql } from '../../lib/db/neon'
import { rowToMultiSigRequest, rowToMultiSig } from '../../lib/db/mappers'
import { isVerifiedAdmin, isVerifiedAs } from '../../lib/auth/siwe'

if (!process.env.DATABASE_URL) throw new Error('No DATABASE_URL in .env file')

const FUNCTION = 'get-content'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Function `%s` invoked', FUNCTION)
  const data = JSON.parse(req.body)
  if (data.action !== undefined && data.data !== undefined) {
    const sql = getSql()

    switch (data.action) {
      case 'getMultiSigRequests': {
        const rows = (await sql`
          SELECT * FROM multisig_requests
          WHERE multi_sig_address = ${data.data.multiSigAddress}
            AND is_active = true
        `) as Record<string, unknown>[]
        const content = rows.map(rowToMultiSigRequest)
        return res.status(200).json({
          message: 'Data retrieved',
          content
        })
      }
      case 'getMultiSigRequestById': {
        const arr = (await sql`
          SELECT * FROM multisig_requests
          WHERE id = ${data.data.multiSigRequestId}
        `) as Record<string, unknown>[]
        if (arr.length === 0) {
          return res.status(404).json({ message: 'Data not found' })
        }
        const content = [rowToMultiSigRequest(arr[0])]
        return res.status(200).json({
          message: 'Data retrieved',
          content
        })
      }
      case 'getMultiSigWallets': {
        // Every wallet (any chain) where the verified account is an owner, so
        // a fresh browser can rebuild its list from the database.
        if (!isVerifiedAs(req, data.data.ownerAddress)) {
          return res.status(401).json({ message: 'Owner does not match the verified wallet' })
        }
        const rows = (await sql`
          SELECT * FROM multisig_wallets
          WHERE EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(owners) AS o
            WHERE LOWER(o) = LOWER(${data.data.ownerAddress})
          )
        `) as Record<string, unknown>[]
        return res.status(200).json({
          message: 'Data retrieved',
          content: rows.map(rowToMultiSig)
        })
      }
      case 'getSavedContracts': {
        if (!isVerifiedAs(req, data.data.ownerAddress)) {
          return res.status(401).json({ message: 'Owner does not match the verified wallet' })
        }
        const rows = (await sql`
          SELECT id, chain_id, chain_name, address, name, abi FROM saved_contracts
          WHERE LOWER(owner_address) = LOWER(${data.data.ownerAddress})
        `) as Record<string, unknown>[]
        const content = rows.map((row) => ({
          id: String(row.id),
          chainId: Number(row.chain_id),
          chainName: String(row.chain_name ?? ''),
          address: String(row.address),
          name: String(row.name),
          abi: row.abi ?? []
        }))
        return res.status(200).json({
          message: 'Data retrieved',
          content
        })
      }
      case 'getFactories': {
        if (!isVerifiedAs(req, data.data.ownerAddress)) {
          return res.status(401).json({ message: 'Owner does not match the verified wallet' })
        }
        const rows = (await sql`
          SELECT chain_id, chain_name, address, name, version FROM factories
          WHERE LOWER(owner_address) = LOWER(${data.data.ownerAddress})
        `) as Record<string, unknown>[]
        const content = rows.map((row) => ({
          chainId: Number(row.chain_id),
          chainName: String(row.chain_name ?? ''),
          address: String(row.address),
          name: String(row.name),
          version: String(row.version ?? ''),
          multiSigCount: 0
        }))
        return res.status(200).json({
          message: 'Data retrieved',
          content
        })
      }
      case 'getAddressBook': {
        // The book is private to its owner; require the SIWE session to match.
        if (!isVerifiedAs(req, data.data.ownerAddress)) {
          return res.status(401).json({ message: 'Address book owner does not match the verified wallet' })
        }
        // All chains at once so a network switch client-side needs no refetch.
        const rows = (await sql`
          SELECT id, chain_id, address, label, kind, is_public FROM address_book
          WHERE LOWER(owner_address) = LOWER(${data.data.ownerAddress})
        `) as Record<string, unknown>[]
        const content = rows.map((row) => ({
          id: String(row.id),
          chainId: Number(row.chain_id),
          address: String(row.address),
          label: String(row.label),
          kind: String(row.kind),
          isPublic: Boolean(row.is_public)
        }))
        return res.status(200).json({
          message: 'Data retrieved',
          content
        })
      }
      case 'getPublicAddressBook': {
        // Entries users chose to share, across all owners and chains, so
        // MyMultiSig admins can see which contracts the community relies on
        // and decide what to support officially. Admin wallets only.
        if (!isVerifiedAdmin(req)) {
          return res.status(403).json({ message: 'Only MyMultiSig admins can view the public address book' })
        }
        const rows = (await sql`
          SELECT id, owner_address, chain_id, address, label, kind FROM address_book
          WHERE is_public = true
          ORDER BY created_at DESC
        `) as Record<string, unknown>[]
        const content = rows.map((row) => ({
          id: String(row.id),
          ownerAddress: String(row.owner_address),
          chainId: Number(row.chain_id),
          address: String(row.address),
          label: String(row.label),
          kind: String(row.kind)
        }))
        return res.status(200).json({
          message: 'Data retrieved',
          content
        })
      }
      default:
        return res.status(400).json({ message: 'Invalid collection' })
    }
  } else {
    console.log('Invalid data')
    return res.status(400).json({
      message: 'Invalid data'
    })
  }
}

export default handler
