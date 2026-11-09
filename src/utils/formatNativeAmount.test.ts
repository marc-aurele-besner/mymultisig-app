import { formatNativeAmount } from './formatNativeAmount'

describe('formatNativeAmount', () => {
  it('shows whole and fractional amounts in the native symbol', () => {
    expect(formatNativeAmount('500000000000000000', 'ETH')).toBe('0.5 ETH')
    expect(formatNativeAmount('1000000000000000000', 'ETH')).toBe('1 ETH')
    expect(formatNativeAmount('1500000000000000000', 'POL')).toBe('1.5 POL')
  })

  it('trims trailing zeros without dropping significant digits', () => {
    expect(formatNativeAmount('10000000000000000000', 'ETH')).toBe('10 ETH')
    expect(formatNativeAmount('1234500000000000000', 'ETH')).toBe('1.2345 ETH')
    expect(formatNativeAmount('1', 'ETH')).toBe('0.000000000000000001 ETH')
  })

  it('shows zero as a plain zero', () => {
    expect(formatNativeAmount('0', 'ETH')).toBe('0 ETH')
  })

  it('keeps full precision for large values', () => {
    expect(formatNativeAmount('123456789123456789123456789', 'ETH')).toBe('123456789.123456789123456789 ETH')
  })

  it('returns non-integer input unchanged instead of inventing an amount', () => {
    expect(formatNativeAmount('', 'ETH')).toBe('')
    expect(formatNativeAmount('1.5', 'ETH')).toBe('1.5')
    expect(formatNativeAmount('-1', 'ETH')).toBe('-1')
  })
})
