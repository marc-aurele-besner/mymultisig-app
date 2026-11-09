import { formatEther } from 'viem'

// Human-readable native-currency amount for a wei string, e.g. "500000000000000000"
// becomes "0.5 ETH". Trailing zeros are trimmed the same way the request builder
// (EthersInput) trims them. A value that is not a non-negative integer is returned
// unchanged so the caller never shows a made-up amount.
export const formatNativeAmount = (wei: string, symbol: string): string => {
  if (!/^\d+$/.test(wei)) return wei
  const formatted = formatEther(BigInt(wei))
  const trimmed = formatted.includes('.') ? formatted.replace(/\.?0+$/, '') : formatted
  return `${trimmed} ${symbol}`
}

export default formatNativeAmount
