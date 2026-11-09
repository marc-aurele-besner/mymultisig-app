jest.mock('../db/neon', () => ({ getDb: jest.fn() }))

import type { EmailRecipientRow } from '../db/schema'
import { pickRecipients } from './recipients'
import { generateLinkToken } from './tokens'
import { renderConfirmSubscription, renderRequestEmail } from './templates'
import { unsubscribeUrl, requestUrl, confirmUrl } from './links'

const OWNER_A = '0x1111111111111111111111111111111111111111'
const OWNER_B = '0x2222222222222222222222222222222222222222'
const STRANGER = '0x3333333333333333333333333333333333333333'

const row = (overrides: Partial<EmailRecipientRow>): EmailRecipientRow =>
  ({
    id: 'id',
    walletAddress: OWNER_A,
    email: 'a@example.com',
    verifiedAt: new Date('2026-01-01T00:00:00Z'),
    linkToken: 'tok-a',
    createdAt: null,
    updatedAt: null,
    ...overrides
  }) as EmailRecipientRow

describe('pickRecipients', () => {
  it('keeps only verified inboxes whose wallet is an owner', () => {
    const rows = [
      row({ walletAddress: OWNER_A, email: 'a@example.com' }),
      row({ walletAddress: OWNER_B, email: 'b@example.com', verifiedAt: null }),
      row({ walletAddress: STRANGER, email: 'stranger@example.com' })
    ]
    const picked = pickRecipients(rows, [OWNER_A, OWNER_B], [])
    expect(picked.map((r) => r.email)).toEqual(['a@example.com'])
  })

  it('drops owners who have already signed or submitted', () => {
    const rows = [
      row({ walletAddress: OWNER_A, email: 'a@example.com' }),
      row({ walletAddress: OWNER_B, email: 'b@example.com', linkToken: 'tok-b' })
    ]
    const picked = pickRecipients(rows, [OWNER_A, OWNER_B], [OWNER_A.toUpperCase().replace('0X', '0x')])
    expect(picked.map((r) => r.email)).toEqual(['b@example.com'])
  })

  it('matches wallet addresses case-insensitively', () => {
    const checksummed = '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01'
    const rows = [row({ walletAddress: checksummed.toLowerCase(), email: 'a@example.com' })]
    expect(pickRecipients(rows, [checksummed], []).map((r) => r.email)).toEqual(['a@example.com'])
  })

  it('sends one message per inbox even when two owners share it', () => {
    const rows = [
      row({ walletAddress: OWNER_A, email: 'shared@example.com', linkToken: 'tok-1' }),
      row({ walletAddress: OWNER_B, email: 'Shared@example.com', linkToken: 'tok-2' })
    ]
    expect(pickRecipients(rows, [OWNER_A, OWNER_B], [])).toHaveLength(1)
  })
})

describe('generateLinkToken', () => {
  it('produces distinct URL-safe tokens of adequate length', () => {
    const a = generateLinkToken()
    const b = generateLinkToken()
    expect(a).not.toBe(b)
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(a.length).toBeGreaterThanOrEqual(40)
  })
})

describe('renderRequestEmail', () => {
  const base = {
    kind: 'needs-signature' as const,
    description: 'Pay <script>alert(1)</script> & "friends"',
    submitter: OWNER_A,
    multiSigAddress: STRANGER,
    multiSigName: 'Treasury',
    chainName: 'Sepolia',
    signatureCount: 1,
    threshold: 2,
    requestUrl: requestUrl('req-1'),
    unsubscribeUrl: unsubscribeUrl('tok-a')
  }

  it('escapes user-authored description in HTML but not in text', () => {
    const email = renderRequestEmail(base)
    expect(email.html).not.toContain('<script>')
    expect(email.html).toContain('&lt;script&gt;')
    expect(email.text).toContain('<script>alert(1)</script>')
  })

  it('includes the request link and the per-recipient unsubscribe link', () => {
    const email = renderRequestEmail(base)
    expect(email.text).toContain('https://mymultisig.app/request/req-1')
    expect(email.text).toContain('https://mymultisig.app/api/email/unsubscribe?token=tok-a')
    expect(email.html).toContain('https://mymultisig.app/api/email/unsubscribe?token=tok-a')
  })

  it('switches heading and progress for the ready-to-execute email', () => {
    const ready = renderRequestEmail({ ...base, kind: 'threshold-reached', signatureCount: 2 })
    expect(ready.subject).toContain('Ready to execute')
    expect(ready.text).toContain('2/2 signatures')
  })

  it('uses the shortened address when the wallet has no name', () => {
    const email = renderRequestEmail({ ...base, multiSigName: null })
    expect(email.subject).toContain('0x3333…3333')
  })
})

describe('renderConfirmSubscription', () => {
  it('contains the confirm link and no unsubscribe link', () => {
    const email = renderConfirmSubscription({ confirmUrl: confirmUrl('tok-a') })
    expect(email.text).toContain('https://mymultisig.app/api/email/confirm?token=tok-a')
    expect(email.text).not.toContain('unsubscribe')
  })
})
