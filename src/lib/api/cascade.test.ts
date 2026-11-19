jest.mock('../db/neon', () => ({ getDb: () => ({}) }))

import { PgDialect } from 'drizzle-orm/pg-core'

import { cascadePredicate, triggerFromState } from './cascade'

const dialect = new PgDialect()
const render = (...args: Parameters<typeof cascadePredicate>) => dialect.sqlToQuery(cascadePredicate(...args))

const source = (txnNonce: string | null) => ({ id: 'src', multiSigAddress: '0xabc', txnNonce })

describe('cascadePredicate', () => {
  it('cancels every other request after an execution, pinned or not', () => {
    for (const trigger of ['executed', 'failed'] as const) {
      expect(render(source('7'), trigger, '3').sql).toBe('TRUE')
      expect(render(source(null), trigger, '3').sql).toBe('TRUE')
    }
  })

  it('compares pinned nonces numerically on a pinned reset', () => {
    const { sql, params } = render(source('10'), 'reset', '3')
    expect(sql).toContain('::numeric')
    expect(sql).toContain('> $1::numeric')
    expect(params).toEqual(['10'])
    expect(sql).not.toContain('IS NULL')
  })

  it('cancels unpinned requests and pinned ones above the wallet nonce on an unpinned cancel', () => {
    const { sql, params } = render(source(null), 'cancelled', '9')
    expect(sql).toContain('"txn_nonce" is null')
    expect(sql).toContain('::numeric')
    expect(params).toEqual(['9'])
  })

  it('treats a non-numeric stored nonce as unpinned', () => {
    const { sql } = render(source('abc'), 'reset', '4')
    expect(sql).toContain('"txn_nonce" is null')
  })
})

describe('triggerFromState', () => {
  const base = { isExecuted: false, isSuccessful: false, isCancelled: false, signatures: ['0xsig'] }

  it('derives the trigger from the stored request', () => {
    expect(triggerFromState({ ...base, isExecuted: true, isSuccessful: true })).toBe('executed')
    expect(triggerFromState({ ...base, isExecuted: true })).toBe('failed')
    expect(triggerFromState({ ...base, isCancelled: true })).toBe('cancelled')
    expect(triggerFromState({ ...base, signatures: [] })).toBe('reset')
  })

  it('refuses a live request that still holds signatures', () => {
    expect(triggerFromState(base)).toBeNull()
  })
})
