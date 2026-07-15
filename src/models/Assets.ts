export interface TokenHolding {
  contractAddress: string
  // Raw balance in base units as a decimal string; format with `decimals`.
  balance: string
  decimals: number
  symbol: string
  name: string
  logo: string | null
}

export interface NftHolding {
  contractAddress: string
  tokenId: string
  tokenType: string
  name: string | null
  collectionName: string | null
  imageUrl: string | null
  balance: string
}

export interface WalletAssets {
  tokens: TokenHolding[]
  nfts: NftHolding[]
  nftTotalCount: number
  tokensError: boolean
  nftsError: boolean
  notConfigured?: boolean
  unsupportedChain?: boolean
}
