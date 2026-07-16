import { MultiSigExecTransactionArgs } from '../models/MultiSigs'
import { isModernWallet } from './contractVersions'

// The EIP-712 Transaction struct the wallet's typehash binds:
// - pre-0.5.0 (all wallet classes):  (to, value, data, gas, nonce)
// - 0.5.0 MyMultiSig:                + validUntil (0 = no expiry)
// - 0.5.0 MyMultiSigExtended:        + operation  (0 = CALL, 1 = DELEGATECALL,
//   bound into the hash even for plain calls — the pre-operation overloads
//   revert with RequiresOperationByte on 0.5.0 Extended wallets)
// Field names and order are part of the typehash; changing them breaks
// isValidSignature on the corresponding deployment.

const LEGACY_FIELDS = [
  { name: 'to', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'data', type: 'bytes' },
  { name: 'gas', type: 'uint256' },
  { name: 'nonce', type: 'uint96' }
] as const

const VALID_UNTIL_FIELD = { name: 'validUntil', type: 'uint256' } as const
const OPERATION_FIELD = { name: 'operation', type: 'uint8' } as const

export type TransactionTypedDataInput = {
  domain: { name: string; version: string; chainId: number | undefined; verifyingContract: `0x${string}` }
  args: MultiSigExecTransactionArgs
  // The nonce the signature binds: the pinned txnNonce when set, otherwise the
  // wallet's current nonce.
  nonce: bigint
  walletVersion: string | undefined
  isExtended: boolean
}

const isNumeric = (value: string | undefined): value is string =>
  value != null && value !== '' && /^\d+$/.test(value)

export const transactionValidUntil = (args: MultiSigExecTransactionArgs): bigint =>
  isNumeric(args.validUntil) ? BigInt(args.validUntil) : 0n

export const transactionOperation = (args: MultiSigExecTransactionArgs): number =>
  args.operation === '1' ? 1 : 0

// Broadly typed (not const-inferred): the struct shape is only known at
// runtime, so consumers sign it as a dynamic typed-data definition.
export type TransactionTypedData = {
  domain: TransactionTypedDataInput['domain']
  types: { Transaction: { name: string; type: string }[] }
  primaryType: 'Transaction'
  message: Record<string, unknown>
}

export const buildTransactionTypedData = ({
  domain,
  args,
  nonce,
  walletVersion,
  isExtended
}: TransactionTypedDataInput): TransactionTypedData => {
  const modern = isModernWallet(walletVersion)
  const types = {
    Transaction: [
      ...LEGACY_FIELDS,
      ...(modern ? [VALID_UNTIL_FIELD] : []),
      ...(modern && isExtended ? [OPERATION_FIELD] : [])
    ]
  }
  const message = {
    to: args.to,
    value: isNumeric(args.value) ? BigInt(args.value) : 0n,
    data: args.data,
    gas: isNumeric(args.txnGas) ? BigInt(args.txnGas) : 0n,
    nonce,
    ...(modern ? { validUntil: transactionValidUntil(args) } : {}),
    ...(modern && isExtended ? { operation: transactionOperation(args) } : {})
  }
  return { domain, types, primaryType: 'Transaction' as const, message }
}
