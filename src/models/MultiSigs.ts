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
  to: `0x${string}`
  value: string
  data: `0x${string}`
  txnGas: string
  signatures: string
}

export type MultiSigTransactionRequest = {
  id: string
  request: MultiSigExecTransactionArgs
  submitter: `0x${string}`
  signatures: string[]
  ownerSigners: `0x${string}`[]
  dateSubmitted: string
  dateExecuted: string
  isExecuted: boolean
  isCancelled: boolean
  isConfirmed: boolean
}
