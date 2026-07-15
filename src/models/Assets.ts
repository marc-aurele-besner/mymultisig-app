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

// A token the user tracks manually; its balance is read straight from the
// chain, so it works even without indexer coverage.
export interface CustomToken {
  chainId: number
  address: string
  symbol: string
  name: string
  decimals: number
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
