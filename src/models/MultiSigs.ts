export type MultiSigFactory = {
  chainId: number
  chainName: string
  address: string
  name: string
  version: string
  multiSigCount: number
}

export type MultiSig = {
  chainId: number
  chainName: string
  factoryAddress: string
  id: number
  name: string
  version: string
  address: string
  threshold: number
  ownerCount: number
  nonce: number
  owners: string[]
  isDeployed?: boolean
}
