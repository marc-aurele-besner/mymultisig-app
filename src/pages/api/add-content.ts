import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuid } from 'uuid'

import { getSql } from '../../lib/db/neon'
import { getVerifiedAddress, isVerifiedAs } from '../../lib/auth/siwe'

if (!process.env.DATABASE_URL) throw new Error('No DATABASE_URL in .env file')

const FUNCTION = 'add-content'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Function `%s` invoked', FUNCTION)
  const data = JSON.parse(req.body)
  if (data.action !== undefined && data.data !== undefined) {
    const sql = getSql()

    // Every write requires a SIWE session; actions that claim an identity
    // additionally require the session wallet to match that identity.
    if (getVerifiedAddress(req) == null) {
      return res.status(401).json({ message: 'Wallet not verified: sign in with your wallet first' })
    }

    switch (data.action) {
      case 'addMultiSigRequest': {
        const doc = { id: uuid(), ...data.data }
        if (!isVerifiedAs(req, doc.submitter)) {
          return res.status(401).json({ message: 'Submitter does not match the verified wallet' })
        }
        // Extended wallets can restrict request creation to owners. Enforce it
        // server-side when the wallet is on record with a usable owner list.
        const wallets = (await sql`
          SELECT owners, allow_only_owner_request FROM multisig_wallets
          WHERE LOWER(address) = LOWER(${doc.multiSigAddress})
          ORDER BY id DESC LIMIT 1
        `) as { owners: string[]; allow_only_owner_request: boolean }[]
        if (wallets.length > 0 && wallets[0].allow_only_owner_request) {
          const owners = (wallets[0].owners ?? []).map((o: string) => o.toLowerCase())
          if (owners.length > 0 && !owners.includes(String(doc.submitter).toLowerCase())) {
            return res.status(403).json({ message: 'This wallet only accepts requests from its owners' })
          }
        }
        await sql`
          INSERT INTO multisig_requests (
            id, multi_sig_address, request, description, submitter,
            signatures, owner_signers, date_submitted, date_executed,
            is_active, is_executed, is_cancelled, is_confirmed, is_successful
          ) VALUES (
            ${doc.id},
            ${doc.multiSigAddress},
            ${JSON.stringify(doc.request)},
            ${doc.description},
            ${doc.submitter},
            ${JSON.stringify(doc.signatures ?? [])},
            ${JSON.stringify(doc.ownerSigners ?? [])},
            ${doc.dateSubmitted},
            ${doc.dateExecuted ?? ''},
            ${doc.isActive ?? true},
            ${doc.isExecuted ?? false},
            ${doc.isCancelled ?? false},
            ${doc.isConfirmed ?? false},
            ${doc.isSuccessful ?? false}
          )
        `
        console.log('Add content done')
        return res.status(200).json({ message: 'Add content done' })
      }
      case 'createMultiSigWallet': {
        // Upsert on (chain, address): saving the same wallet from another
        // device refreshes the row instead of duplicating it.
        const doc = data.data
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
          return res.status(200).json({ message: 'Add content done' })
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
      }
      case 'updateMultiSigWallet': {
        // Mirrors client-side wallet patches (owner changes, threshold, policy)
        // so the stored wallet survives a local store reset and the owner-only
        // request guard sees current owners.
        const doc = data.data
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
      }
      case 'addAddressBookEntry': {
        // Upsert: saving an address that already exists for this owner/chain
        // just refreshes its label and kind.
        const doc = data.data
        if (!doc.ownerAddress || !doc.address || doc.chainId === undefined || !doc.label) {
          return res.status(400).json({ message: 'Missing address book fields' })
        }
        if (!isVerifiedAs(req, doc.ownerAddress)) {
          return res.status(401).json({ message: 'Address book owner does not match the verified wallet' })
        }
        const existing = (await sql`
          SELECT id FROM address_book
          WHERE LOWER(owner_address) = LOWER(${doc.ownerAddress})
            AND chain_id = ${doc.chainId}
            AND LOWER(address) = LOWER(${doc.address})
          LIMIT 1
        `) as { id: string }[]
        if (existing.length > 0) {
          await sql`
            UPDATE address_book SET label = ${doc.label}, kind = ${doc.kind ?? 'wallet'}
            WHERE id = ${existing[0].id}
          `
        } else {
          await sql`
            INSERT INTO address_book (id, owner_address, chain_id, address, label, kind)
            VALUES (${uuid()}, ${doc.ownerAddress}, ${doc.chainId}, ${doc.address}, ${doc.label}, ${doc.kind ?? 'wallet'})
          `
        }
        console.log('Address book upsert done')
        return res.status(200).json({ message: 'Address book upsert done' })
      }
      case 'addSavedContract': {
        // Upsert a call-builder contract (name + ABI) for the verified owner.
        const doc = data.data
        if (!doc.ownerAddress || !doc.address || doc.chainId === undefined || !doc.name || doc.abi == null) {
          return res.status(400).json({ message: 'Missing saved contract fields' })
        }
        if (!isVerifiedAs(req, doc.ownerAddress)) {
          return res.status(401).json({ message: 'Contract owner does not match the verified wallet' })
        }
        const existing = (await sql`
          SELECT id FROM saved_contracts
          WHERE LOWER(owner_address) = LOWER(${doc.ownerAddress})
            AND chain_id = ${doc.chainId}
            AND LOWER(address) = LOWER(${doc.address})
          LIMIT 1
        `) as { id: string }[]
        if (existing.length > 0) {
          await sql`
            UPDATE saved_contracts SET name = ${doc.name}, abi = ${JSON.stringify(doc.abi)}
            WHERE id = ${existing[0].id}
          `
        } else {
          await sql`
            INSERT INTO saved_contracts (id, owner_address, chain_id, chain_name, address, name, abi)
            VALUES (${uuid()}, ${doc.ownerAddress}, ${doc.chainId}, ${doc.chainName ?? ''}, ${doc.address}, ${doc.name}, ${JSON.stringify(doc.abi)})
          `
        }
        console.log('Saved contract upsert done')
        return res.status(200).json({ message: 'Saved contract upsert done' })
      }
      case 'addFactory': {
        // Upsert a user-deployed factory so it follows the account.
        const doc = data.data
        if (!doc.ownerAddress || !doc.address || doc.chainId === undefined || !doc.name) {
          return res.status(400).json({ message: 'Missing factory fields' })
        }
        if (!isVerifiedAs(req, doc.ownerAddress)) {
          return res.status(401).json({ message: 'Factory owner does not match the verified wallet' })
        }
        const existing = (await sql`
          SELECT id FROM factories
          WHERE LOWER(owner_address) = LOWER(${doc.ownerAddress})
            AND chain_id = ${doc.chainId}
            AND LOWER(address) = LOWER(${doc.address})
          LIMIT 1
        `) as { id: string }[]
        if (existing.length === 0) {
          await sql`
            INSERT INTO factories (id, owner_address, chain_id, chain_name, address, name, version)
            VALUES (${uuid()}, ${doc.ownerAddress}, ${doc.chainId}, ${doc.chainName ?? ''}, ${doc.address}, ${doc.name}, ${doc.version ?? ''})
          `
        }
        console.log('Factory upsert done')
        return res.status(200).json({ message: 'Factory upsert done' })
      }
      case 'removeAddressBookEntry': {
        const doc = data.data
        if (!doc.ownerAddress || !doc.address || doc.chainId === undefined) {
          return res.status(400).json({ message: 'Missing address book fields' })
        }
        if (!isVerifiedAs(req, doc.ownerAddress)) {
          return res.status(401).json({ message: 'Address book owner does not match the verified wallet' })
        }
        await sql`
          DELETE FROM address_book
          WHERE LOWER(owner_address) = LOWER(${doc.ownerAddress})
            AND chain_id = ${doc.chainId}
            AND LOWER(address) = LOWER(${doc.address})
        `
        console.log('Address book removal done')
        return res.status(200).json({ message: 'Address book removal done' })
      }
      default:
        return res.status(400).json({ message: 'Invalid collection' })
    }
  } else {
    console.log('Invalid data')
    return res.status(400).json({
      message: JSON.stringify('Invalid data')
    })
  }
}

export default handler
