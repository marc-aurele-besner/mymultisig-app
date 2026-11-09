// The subset of a stored request's `request` payload that the wallet's
// execTransaction / EIP-712 struct consume. The app's
// MultiSigExecTransactionArgs (src/models/MultiSigs.ts) is a structural
// superset, so it can be passed anywhere this type is expected.
export type ExecTransactionArgs = {
  to: `0x${string}`
  // Decimal strings: requests round-trip through JSONB, so no bigint here.
  value: string
  data: `0x${string}`
  txnGas: string
  // The combined signature blob the wallet consumes (see combineSignatures).
  signatures: string
  // Extended wallets only: pin the request to an explicit nonce.
  txnNonce?: string
  // 0.5.0 wallets only: unix-seconds deadline; unset/'0' = no expiry.
  validUntil?: string
  // 0.5.0 Extended wallets only: '0' = CALL (default), '1' = DELEGATECALL.
  operation?: string
}

export type WalletType = 'simple' | 'extended' | 'advanced'

export const isExtendedWallet = (walletType: WalletType | undefined): boolean =>
  walletType === 'extended' || walletType === 'advanced'
