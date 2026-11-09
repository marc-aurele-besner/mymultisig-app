import { formatRequestDate, parseRequestDate } from './requestDate'

describe('parseRequestDate', () => {
  it('reads epoch milliseconds stored as a string', () => {
    expect(parseRequestDate('1762700000000')?.getTime()).toBe(1762700000000)
  })

  it('reads ISO strings', () => {
    expect(parseRequestDate('2026-11-09T15:42:10.000Z')?.toISOString()).toBe('2026-11-09T15:42:10.000Z')
  })

  it('reads numbers', () => {
    expect(parseRequestDate(1762700000000)?.getTime()).toBe(1762700000000)
  })

  it('returns null for empty or unparseable values', () => {
    expect(parseRequestDate('')).toBeNull()
    expect(parseRequestDate(null)).toBeNull()
    expect(parseRequestDate(undefined)).toBeNull()
    expect(parseRequestDate('not a date')).toBeNull()
  })
})

describe('formatRequestDate', () => {
  it('never returns "Invalid Date"', () => {
    expect(formatRequestDate('2026-11-09T15:42:10.000Z')).not.toBe('Invalid Date')
    expect(formatRequestDate('garbage')).toBeNull()
  })
})
