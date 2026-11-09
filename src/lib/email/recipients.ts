import { and, eq, isNotNull, sql } from 'drizzle-orm'

import { getDb } from '../db/neon'
import { emailRecipients, multisigWallets } from '../db/schema'
import type { EmailRecipientRow } from '../db/schema'
import { generateLinkToken } from './tokens'

// Owner-facing inbox management for email notifications. One email_recipients
// row per signer wallet; the verified flag gates delivery (double opt-in).
// Every wallet address comparison is case-insensitive because owner lists and
// session addresses are not always checksummed the same way.

const lower = (value: string) => value.toLowerCase()

// Pure selection used by the notifier and covered by unit tests. Keeps only
// verified inboxes whose wallet is an owner and has not already signed.
// Returns the matching rows so the caller can build a per-recipient link.
export const pickRecipients = (
  rows: EmailRecipientRow[],
  owners: string[],
  excludeSigners: string[]
): EmailRecipientRow[] => {
  const ownerSet = new Set(owners.map(lower))
  const excluded = new Set(excludeSigners.map(lower))
  const seenEmails = new Set<string>()
  const picked: EmailRecipientRow[] = []
  for (const row of rows) {
    const wallet = lower(row.walletAddress)
    if (row.verifiedAt == null) continue
    if (!ownerSet.has(wallet) || excluded.has(wallet)) continue
    // One message per inbox even if two owner wallets share an address book.
    if (seenEmails.has(lower(row.email))) continue
    seenEmails.add(lower(row.email))
    picked.push(row)
  }
  return picked
}

// True when the wallet appears in the owners array of at least one multisig.
// Only owners may subscribe: the inbox belongs to a signer, not to anyone
// who happens to sign in.
export const isWalletOwnerOfAnyMultiSig = async (walletAddress: string): Promise<boolean> => {
  const db = getDb()
  const rows = await db
    .select({ id: multisigWallets.id })
    .from(multisigWallets)
    .where(
      sql`EXISTS (SELECT 1 FROM jsonb_array_elements_text(${multisigWallets.owners}) AS o WHERE LOWER(o) = LOWER(${walletAddress}))`
    )
    .limit(1)
  return rows.length > 0
}

export const findSubscriptionByWallet = async (walletAddress: string): Promise<EmailRecipientRow | null> => {
  const db = getDb()
  const rows = await db
    .select()
    .from(emailRecipients)
    .where(sql`LOWER(${emailRecipients.walletAddress}) = LOWER(${walletAddress})`)
    .limit(1)
  return rows[0] ?? null
}

export interface UpsertResult {
  row: EmailRecipientRow
  // True when a confirmation email must be sent for this row.
  needsConfirmation: boolean
}

// Store or replace the inbox for a wallet. Changing the address clears the
// verified flag and rotates the link token, so an old confirm or unsubscribe
// link can no longer act on the new address.
export const upsertSubscription = async (walletAddress: string, email: string): Promise<UpsertResult> => {
  const db = getDb()
  const normalized = lower(email.trim())
  const existing = await findSubscriptionByWallet(walletAddress)

  if (existing != null && lower(existing.email) === normalized) {
    if (existing.verifiedAt != null) return { row: existing, needsConfirmation: false }
    return { row: existing, needsConfirmation: true }
  }

  if (existing != null) {
    const updated = await db
      .update(emailRecipients)
      .set({
        email: normalized,
        verifiedAt: null,
        linkToken: generateLinkToken(),
        updatedAt: new Date()
      })
      .where(eq(emailRecipients.id, existing.id))
      .returning()
    return { row: updated[0], needsConfirmation: true }
  }

  const inserted = await db
    .insert(emailRecipients)
    .values({
      walletAddress: walletAddress,
      email: normalized,
      linkToken: generateLinkToken()
    })
    .returning()
  return { row: inserted[0], needsConfirmation: true }
}

// Marks the inbox as verified. Returns null when the token matches nothing,
// which covers both a bad link and a link for an address that was since changed.
export const confirmSubscription = async (linkToken: string): Promise<EmailRecipientRow | null> => {
  const db = getDb()
  const updated = await db
    .update(emailRecipients)
    .set({ verifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(emailRecipients.linkToken, linkToken))
    .returning()
  return updated[0] ?? null
}

export const removeSubscriptionByToken = async (linkToken: string): Promise<boolean> => {
  const db = getDb()
  const deleted = await db.delete(emailRecipients).where(eq(emailRecipients.linkToken, linkToken)).returning({
    id: emailRecipients.id
  })
  return deleted.length > 0
}

export const removeSubscriptionForWallet = async (walletAddress: string): Promise<boolean> => {
  const db = getDb()
  const deleted = await db
    .delete(emailRecipients)
    .where(sql`LOWER(${emailRecipients.walletAddress}) = LOWER(${walletAddress})`)
    .returning({ id: emailRecipients.id })
  return deleted.length > 0
}

// Verified inboxes for any of the given owner addresses. The notifier narrows
// this further with pickRecipients.
export const listVerifiedForOwners = async (owners: string[]): Promise<EmailRecipientRow[]> => {
  if (owners.length === 0) return []
  const db = getDb()
  const lowered = owners.map(lower)
  return db
    .select()
    .from(emailRecipients)
    .where(
      and(
        isNotNull(emailRecipients.verifiedAt),
        sql`LOWER(${emailRecipients.walletAddress}) IN (${sql.join(
          lowered.map((o) => sql`${o}`),
          sql`, `
        )})`
      )
    )
}
