export type MultiSigFactory = {
  chainId: number
  chainName: string
  address: `0x${string}`
  name: string
  version: string
  multiSigCount: number
}

export type MultiSig = {
  chainId: number
  chainName: string
  factoryAddress: `0x${string}`
  id: number
  name: string
  version: string
  address: `0x${string}`
  threshold: number
  ownerCount: number
  nonce: number
  owners: string[]
  isDeployed?: boolean
}

export type MultiSigConstructorArgs = {
  contractName: string
  owners: string[]
  threshold: number
}

export type MultiSigExecTransactionArgs = {
  to: string
  value: string
  data: string
  txnGas: string
  signatures: string
}
