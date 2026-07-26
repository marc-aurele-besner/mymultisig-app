import { and, desc, eq, sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { getDb } from '../../../lib/db/neon'
import { multisigRequests, multisigWallets } from '../../../lib/db/schema'
import { rowToMultiSigRequest } from '../../../lib/db/mappers'
import { parseBody, parseQueryString, withSession, withVerifiedAs } from '../../../lib/api/middleware'
import { explorerUrlForChain } from '../../../lib/notifications/chains'
import { notifyNewRequest } from '../../../lib/notifications/dispatcher'

// Dedicated endpoints for multisig transaction requests:
//   POST /api/multisig-requests         addMultiSigRequest
//   GET  /api/multisig-requests?…       getMultiSigRequests   (public read)
//
// `addMultiSigRequest` requires the SIWE session to match the body-claimed
// `submitter`. The 403 for `allow_only_owner_request` (extended wallets that
// only accept requests from their owners) lives inside the handler because it
// needs a fresh wallet row.
//
// After a successful insert, the handler fires notifyNewRequest (Slack /
// Discord / Telegram fan-out) via void .catch — fire-and-forget so
// notification latency and failures never block the user's request-create
// response, matching the `app_uninstalled` cleanup pattern at
// src/pages/api/slack/events.ts:59-66. The wallet row's chainId +
// threshold + chainName feed the notification payload; the request row
// has no chain context of its own (verified in the schema — column is
// deliberately absent).
const createHandler = withVerifiedAs(
  (req) => (parseBody(req) as { submitter?: string }).submitter,
  async (req, res) => {
    const db = getDb()
    const body = parseBody(req) as Record<string, unknown>
    const doc: Record<string, unknown> = { ...body }

    // Reject garbage UUIDs from clients that don't know the column is UUID.
    // The column would 500 on a non-UUID insert otherwise.
    if (
      doc.id != null &&
      (typeof doc.id !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doc.id))
    ) {
      return res.status(400).json({ message: 'id must be a UUID' })
    }

    const wallets = await db
      .select({
        allowOnlyOwnerRequest: multisigWallets.allowOnlyOwnerRequest,
        owners: multisigWallets.owners,
        chainId: multisigWallets.chainId,
        chainName: multisigWallets.chainName,
        threshold: multisigWallets.threshold
      })
      .from(multisigWallets)
      .where(sql`LOWER(${multisigWallets.address}) = LOWER(${String(doc.multiSigAddress)})`)
      .orderBy(desc(multisigWallets.id))
      .limit(1)
    const walletRow = wallets[0]
    if (walletRow != null && walletRow.allowOnlyOwnerRequest) {
      const owners = (walletRow.owners ?? []).map((o: string) => o.toLowerCase())
      if (owners.length > 0 && !owners.includes(String(doc.submitter ?? '').toLowerCase())) {
        return res.status(403).json({ message: 'This wallet only accepts requests from its owners' })
      }
    }

    const inserted = await db
      .insert(multisigRequests)
      .values({
        // Persist the client-supplied UUID when present (the browser generates
        // one optimistically so the new row appears in the list immediately).
        // Falls back to the column's uuid_generate_v4() default when missing.
        // Invalid UUIDs are rejected with 400 below before reaching this point.
        ...(typeof doc.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doc.id)
          ? { id: doc.id }
          : {}),
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
        isSuccessful: (doc.isSuccessful as boolean) ?? false,
        // Pin the queue column when the request was built against an explicit
        // txnNonce (Extended wallets). Empty/undefined becomes NULL — unpinned
        // requests whose effective nonce resolves to the wallet's current
        // nonce at read time.
        txnNonce: (() => {
          const fromRequest = (doc.request as Record<string, unknown> | undefined)?.txnNonce
          if (typeof fromRequest === 'string' && fromRequest !== '') return fromRequest
          if (typeof doc.txnNonce === 'string' && doc.txnNonce !== '') return doc.txnNonce
          return null
        })(),
        dateCancelled: '',
        cancelledBy: ''
      })
      .returning({ id: multisigRequests.id })
    const insertedId = inserted[0]?.id

    // Fire the cross-cutting notifier. Best-effort — never blocks or
    // 5xx's the POST endpoint. Errors are caught and logged inside
    // notifyNewRequest itself; the catch here is a backstop for any
    // throw from the surrounding Promise.allSettled (shouldn't happen
    // but a defensive net costs nothing).
    if (insertedId != null && walletRow != null) {
      const persistedRequest = rowToMultiSigRequest({
        id: insertedId,
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
        isSuccessful: (doc.isSuccessful as boolean) ?? false,
        txnNonce: ((doc.request as Record<string, unknown> | undefined)?.txnNonce as string | null) ?? null,
        dateCancelled: '',
        cancelledBy: '',
        createdAt: null
      } as any)
      void notifyNewRequest({
        request: persistedRequest,
        chainId: walletRow.chainId,
        chainName: walletRow.chainName ?? null,
        threshold: walletRow.threshold,
        explorerUrl: explorerUrlForChain(walletRow.chainId)
      }).catch((e) => {
        console.error('notifyNewRequest failed', (e as Error).message)
      })
    }

    console.log('Add request done')
    return res.status(200).json({ message: 'Add request done', content: { id: insertedId ?? null } })
  }
)

const listHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { multiSigAddress } = parseQueryString(req)
  if (multiSigAddress === '') {
    return res.status(400).json({ message: 'Missing multiSigAddress' })
  }
  const db = getDb()
  // LEFT JOIN reads the wallet nonce in the same query so the list view
  // can show a "Next" badge without a second round-trip. The join is
  // LOWER-case-insensitive because users paste addresses mixed-case.
  const rows = await db
    .select({
      request: multisigRequests,
      walletNonce: multisigWallets.nonce
    })
    .from(multisigRequests)
    .leftJoin(
      multisigWallets,
      sql`LOWER(${multisigWallets.address}) = LOWER(${multisigRequests.multiSigAddress})`
    )
    .where(and(eq(multisigRequests.multiSigAddress, multiSigAddress), eq(multisigRequests.isActive, true)))
    // Queue ordering. UserOp requests (request.mode='userop') use the
    // EntryPoint nonce, not the wallet's transaction nonce — push them
    // to the end of the list. Then by effective nonce (pinned txn_nonce
    // ascending, NULLS LAST keeps unpinned requests — whose effective
    // nonce is the wallet nonce — at the top), then by submission time
    // as a tiebreaker.
    .orderBy(
      sql`(${multisigRequests.request}->>'mode') = 'userop' ASC`,
      multisigRequests.isCancelled,
      sql`${multisigRequests.txnNonce} ASC NULLS LAST`,
      multisigRequests.dateSubmitted
    )
  return res.status(200).json({
    message: 'Data retrieved',
    content: rows.map((row) => rowToMultiSigRequest(row.request)),
    walletNonce: rows[0]?.walletNonce ?? null
  })
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') return listHandler(req, res)
  if (req.method === 'POST') return createHandler(req, res)
  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ message: 'Method not allowed' })
}

export default handler
