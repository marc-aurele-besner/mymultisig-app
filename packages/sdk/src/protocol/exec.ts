import type { Abi } from 'viem'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'

import { LegacyWalletErrors } from './legacyAbi'
import { transactionOperation, transactionValidUntil } from './typedData'
import type { ExecTransactionArgs } from './types'
import { isModernWallet } from './versions'

// Keeps only the execTransaction overload whose input types match exactly.
// viem resolves overloads by name and argument count, which cannot separate
// the 0.5.0 Extended ABI's two 7-arg overloads ((..., nonce, validUntil, sigs)
// vs (..., validUntil, operation, sigs)) — and the first of those reverts with
// RequiresOperationByte on 0.5.0 wallets. Legacy custom errors ride along so
// pre-0.5.0 reverts still decode to their names.
export const withExactExecOverload = (abi: Abi, inputTypes: string): Abi => [
  ...abi.filter(
    (item) =>
      !(item.type === 'function' && item.name === 'execTransaction') ||
      item.inputs.map((input) => input.type).join(',') === inputTypes
  ),
  ...(LegacyWalletErrors as unknown as Abi)
]

export type ExecTransactionCall = {
  abi: Abi
  functionName: 'execTransaction'
  args: readonly unknown[]
  // The exact overload selected, e.g. 'address,uint256,bytes,uint256,bytes'.
  inputTypes: string
}

export type ExecTransactionCallInput = {
  args: ExecTransactionArgs
  walletVersion: string | undefined
  isExtended: boolean
}

// Overload per wallet generation:
// - 0.5.0 Extended: operation byte required (the pre-operation overloads
//   revert with RequiresOperationByte) — 8-arg with a pinned nonce, 7-arg
//   (validUntil, operation) against the current nonce otherwise.
// - 0.5.0 base: 6-arg with validUntil.
// - pre-0.5.0: the original 6-arg pinned-nonce / 5-arg overloads.
export const buildExecTransactionCall = ({
  args,
  walletVersion,
  isExtended
}: ExecTransactionCallInput): ExecTransactionCall => {
  const modern = isModernWallet(walletVersion)
  const pinned = args.txnNonce != null && args.txnNonce !== ''
  const validUntil = transactionValidUntil(args)
  const operation = transactionOperation(args)
  const pick = (abi: Abi, inputTypes: string, callArgs: readonly unknown[]): ExecTransactionCall => ({
    abi: withExactExecOverload(abi, inputTypes),
    functionName: 'execTransaction',
    args: callArgs,
    inputTypes
  })
  if (modern && isExtended && pinned)
    return pick(MyMultiSigExtended as Abi, 'address,uint256,bytes,uint256,uint256,uint256,uint8,bytes', [
      args.to,
      args.value,
      args.data,
      args.txnGas,
      args.txnNonce,
      validUntil,
      operation,
      args.signatures
    ])
  if (modern && isExtended)
    return pick(MyMultiSigExtended as Abi, 'address,uint256,bytes,uint256,uint256,uint8,bytes', [
      args.to,
      args.value,
      args.data,
      args.txnGas,
      validUntil,
      operation,
      args.signatures
    ])
  if (modern)
    return pick(MyMultiSig as Abi, 'address,uint256,bytes,uint256,uint256,bytes', [
      args.to,
      args.value,
      args.data,
      args.txnGas,
      validUntil,
      args.signatures
    ])
  if (pinned)
    return pick(MyMultiSigExtended as Abi, 'address,uint256,bytes,uint256,uint256,bytes', [
      args.to,
      args.value,
      args.data,
      args.txnGas,
      args.txnNonce,
      args.signatures
    ])
  return pick(MyMultiSig as Abi, 'address,uint256,bytes,uint256,bytes', [
    args.to,
    args.value,
    args.data,
    args.txnGas,
    args.signatures
  ])
}
