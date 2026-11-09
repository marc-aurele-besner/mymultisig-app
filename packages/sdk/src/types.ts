import type { ExecTransactionArgs, WalletType } from './protocol'

// Wire shapes of the mymultisig.app REST API. They mirror
// src/models/MultiSigs.ts in the web app (MultiSig, MultiSigTransactionRequest)
// and only list the fields agent tooling reads or writes; the server
// round-trips any extra fields untouched.

export type StoredWallet = {
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

export type RequestPayload = ExecTransactionArgs & {
  mode?: 'standard' | 'userop'
  executionTxHash?: `0x${string}`
  [extra: string]: unknown
}

export type StoredRequest = {
  id: string
  multiSigAddress: `0x${string}`
  request: RequestPayload
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
  txnNonce?: string | null
  dateCancelled: string
  cancelledBy: string
}

export type ApiKeyScope = 'read' | 'propose' | 'sign' | 'manage'

export const API_KEY_SCOPES: readonly ApiKeyScope[] = ['read', 'propose', 'sign', 'manage']

export type ApiKeyInfo = {
  id: string
  name: string
  keyPrefix: string
  scopes: ApiKeyScope[]
  walletAddresses: string[]
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string | null
  revokedAt: string | null
}

// Live on-chain view of a wallet.
export type WalletInfo = {
  chainId: number
  address: `0x${string}`
  name: string
  version: string
  threshold: number
  ownerCount: number
  nonce: bigint
  // undefined on pre-0.5.0 wallets, which keep owners in a bare mapping.
  owners: `0x${string}`[] | undefined
  // On-chain probes can't tell 'advanced' from 'extended' (same bytecode).
  walletType: 'simple' | 'extended'
  allowOnlyOwnerRequest: boolean
}
