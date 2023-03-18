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
  multiSigAddress: `0x${string}`
  request: MultiSigExecTransactionArgs
  description: string
  submitter: `0x${string}`
  signatures: string[]
  ownerSigners: `0x${string}`[]
  dateSubmitted: string
  dateExecuted: string
  isActive: boolean
  isExecuted: boolean
  isCancelled: boolean
  isConfirmed: boolean
}

export type MultiSigOnChainData = {
  name: string
  version: string
  threshold: number
  ownerCount: number
  nonce: number
  owners: string[]
}

export type MultiSigRequestDB = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: any
  data: MultiSigTransactionRequest
}

export type BuildMultiSigRequest = {
  to: `0x${string}`
  value: string
  txnGas: string
  description: string
  arguments: object
}
