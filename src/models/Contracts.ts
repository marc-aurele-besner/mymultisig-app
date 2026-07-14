import { JsonFragment } from '@ethersproject/abi'

export type Contract = {
  chainId: number
  chainName: string
  id: string
  name: string
  address: `0x${string}`
  creator: `0x${string}`
  abi: JsonFragment[]
  isMultiSig: boolean
  isPublic: boolean
  isVerified: boolean
  isWhitelisted: boolean
  isChainSpecific: boolean
  isWalletSpecific: boolean
}
