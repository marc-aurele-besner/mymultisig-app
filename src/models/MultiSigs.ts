export type MultiSigFactory = {
  chainId: number
  chainName: string
  address: `0x${string}`
  name: string
  version: string
  multiSigCount: number
}

// 'advanced' wallets share the Extended bytecode; the distinction is factory
// bookkeeping (createMyMultiSigAdvanced / advancedCount on 0.5.0 factories),
// so on-chain probes report them as 'extended' and only the stored wallet
// record remembers the creation type.
export type WalletType = 'simple' | 'extended' | 'advanced'

export const isExtendedWallet = (walletType: WalletType | undefined): boolean =>
  walletType === 'extended' || walletType === 'advanced'

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
  walletType?: WalletType
  allowOnlyOwnerRequest?: boolean
}

export type MultiSigConstructorArgs = {
  contractName: string
  owners: string[]
  threshold: number
  walletType?: WalletType
  isOnlyOwnerRequest?: boolean
  // 0.5.0 factories only: bytes32 CREATE2 salt. When set, creation goes
  // through createDeterministic* so the same creator + salt + constructor
  // arguments yield the same wallet address on every chain.
  salt?: `0x${string}`
}

export type BatchStep = {
  to: `0x${string}`
  value: string
  data: `0x${string}`
  txnGas: string
}

export type BatchResult = {
  success: boolean
  returnData: string
}

export type MultiSigExecTransactionArgs = {
  to: `0x${string}`
  value: string
  data: `0x${string}`
  txnGas: string
  signatures: string
  // Extended wallets only: pin the request to an explicit nonce (6-arg overload)
  txnNonce?: string
  // 0.5.0 wallets only: unix-seconds deadline bound into the EIP-712 hash;
  // unset/'0' = no expiry. Signatures die past it (SignatureExpired).
  validUntil?: string
  // 0.5.0 Extended wallets only: '0' = CALL (default), '1' = DELEGATECALL
  // (gated on-chain to to == the wallet itself). Bound into the EIP-712 hash.
  operation?: string
  // Set when the request is a batch built through multiRequest; results are
  // filled in from the MultiRequestExecuted event after execution.
  batchSteps?: BatchStep[]
  batchResults?: BatchResult[]
  // 0.5.0 wallets only: batch encoded as multiRequestStrict — atomic, the
  // whole transaction reverts on the first failing step.
  strictBatch?: boolean
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
  isSuccessful: boolean
}

export type MultiSigOnChainData = {
  name: string
  version: string
  threshold: number
  ownerCount: number
  nonce: number
  owners: string[]
}

export type BuildMultiSigRequest = {
  to: `0x${string}`
  value: string
  txnGas: string
  description: string
  arguments: object
}
