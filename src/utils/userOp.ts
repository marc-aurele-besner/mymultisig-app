import { encodeAbiParameters, encodeFunctionData, getAddress, toHex, trim, type Hex } from 'viem'

import { PackedUserOpJson, UserOpGas } from '../models/MultiSigs'
import { combineSignatures } from './signatureBlob'

// Minimal ABI for the wallet's `execute(to, value, data)` entry point. The
// full Extended ABI is JSON-typed and viem's encodeFunctionData is happiest
// with a const tuple, so we redeclare the one entry point we need here.
const WALLET_EXECUTE_ABI = [
  {
    type: 'function',
    name: 'execute',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' }
    ],
    outputs: []
  }
] as const

// PackedUserOperation helpers for the 0.5.0 Extended wallet's ERC-4337 v0.7
// surface. The wallet's `execute(to, value, data)` (EntryPoint-only) is the
// only call shape the account accepts on the UserOp path.

export const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000' as const
export const EMPTY_PAYMASTER_AND_DATA = '0x' as const

// Sane Sepolia-friendly defaults. Wallets can override these per request so
// gas estimation can refine them later.
export const DEFAULT_USEROP_GAS: UserOpGas = {
  verificationGasLimit: '180000',
  callGasLimit: '200000',
  preVerificationGas: '50000',
  maxFeePerGas: '2000000000',
  maxPriorityFeePerGas: '1000000000'
}

export const encodeUserOpCallData = ({
  wallet: _wallet,
  to,
  value,
  data
}: {
  wallet: `0x${string}`
  to: `0x${string}`
  value: bigint
  data: `0x${string}`
}): `0x${string}` =>
  encodeFunctionData({
    abi: WALLET_EXECUTE_ABI,
    functionName: 'execute',
    args: [to, value, data]
  }) as `0x${string}`

export type PackedUserOp = {
  sender: `0x${string}`
  nonce: bigint
  initCode: `0x${string}`
  callData: `0x${string}`
  accountGasLimits: `0x${string}`
  preVerificationGas: bigint
  gasFees: `0x${string}`
  paymasterAndData: `0x${string}`
  signature: `0x${string}`
}

// The two packed-bytes32 gas fields of the v0.7 PackedUserOperation.
export const packAccountGasLimits = ({
  verificationGasLimit,
  callGasLimit
}: Pick<UserOpGas, 'verificationGasLimit' | 'callGasLimit'>): `0x${string}` => {
  const verify = BigInt(verificationGasLimit)
  const call = BigInt(callGasLimit)
  const hi = (verify >> 128n) & 0xffffffffffffffffffffffffffffffffn
  const lo = verify & 0xffffffffffffffffffffffffffffffffn
  return ((hi << 128n) | call).toString(16).padStart(64, '0').replace(/^/, '0x') as `0x${string}`
}

export const packGasFees = ({
  maxPriorityFeePerGas,
  maxFeePerGas
}: Pick<UserOpGas, 'maxPriorityFeePerGas' | 'maxFeePerGas'>): `0x${string}` => {
  const priority = BigInt(maxPriorityFeePerGas)
  const max = BigInt(maxFeePerGas)
  return ((priority << 128n) | (max & 0xffffffffffffffffffffffffffffffffn))
    .toString(16)
    .padStart(64, '0')
    .replace(/^/, '0x') as `0x${string}`
}

export const unpackAccountGasLimits = (
  packed: `0x${string}`
): { verificationGasLimit: bigint; callGasLimit: bigint } => {
  const raw = BigInt(packed)
  const mask = (1n << 128n) - 1n
  return { verificationGasLimit: (raw >> 128n) & mask, callGasLimit: raw & mask }
}

export const unpackGasFees = (packed: `0x${string}`): { maxPriorityFeePerGas: bigint; maxFeePerGas: bigint } => {
  const raw = BigInt(packed)
  const mask = (1n << 128n) - 1n
  return { maxPriorityFeePerGas: (raw >> 128n) & mask, maxFeePerGas: raw & mask }
}

export const buildPackedUserOp = ({
  sender,
  nonce,
  initCode = '0x',
  callData,
  gas,
  paymasterAndData = EMPTY_PAYMASTER_AND_DATA,
  signature = '0x'
}: {
  sender: `0x${string}`
  nonce: bigint
  initCode?: `0x${string}`
  callData: `0x${string}`
  gas: UserOpGas
  paymasterAndData?: `0x${string}`
  signature?: `0x${string}`
}): PackedUserOp => ({
  sender,
  nonce,
  initCode,
  callData,
  accountGasLimits: packAccountGasLimits(gas),
  preVerificationGas: BigInt(gas.preVerificationGas),
  gasFees: packGasFees(gas),
  paymasterAndData,
  signature
})

const bigintToHex = (value: bigint): `0x${string}` => toHex(value)
const hexToBigint = (value: string): bigint => BigInt(value || '0x0')

export const userOpToJson = (op: PackedUserOp): PackedUserOpJson => ({
  sender: getAddress(op.sender),
  nonce: bigintToHex(op.nonce),
  initCode: trim(op.initCode as Hex) ?? '0x',
  callData: trim(op.callData as Hex) ?? '0x',
  accountGasLimits: trim(op.accountGasLimits as Hex) ?? ZERO_BYTES32,
  preVerificationGas: bigintToHex(op.preVerificationGas),
  gasFees: trim(op.gasFees as Hex) ?? ZERO_BYTES32,
  paymasterAndData: trim(op.paymasterAndData as Hex) ?? '0x',
  signature: trim(op.signature as Hex) ?? '0x'
})

export const userOpFromJson = (op: PackedUserOpJson): PackedUserOp => ({
  sender: getAddress(op.sender),
  nonce: hexToBigint(op.nonce),
  initCode: (op.initCode || '0x') as `0x${string}`,
  callData: (op.callData || '0x') as `0x${string}`,
  accountGasLimits: (op.accountGasLimits || ZERO_BYTES32) as `0x${string}`,
  preVerificationGas: hexToBigint(op.preVerificationGas),
  gasFees: (op.gasFees || ZERO_BYTES32) as `0x${string}`,
  paymasterAndData: (op.paymasterAndData || '0x') as `0x${string}`,
  signature: (op.signature || '0x') as `0x${string}`
})

// The wallet's `validateUserOp` consumes the same `(owner, sig)[]` blob as
// `execTransaction`, so the existing combinator is the single source of truth.
export const packUserOpSignatures = (
  walletVersion: string | undefined,
  ownerSigners: string[],
  signatures: string[]
): `0x${string}` => combineSignatures(walletVersion, ownerSigners, signatures)

// The EIP-712-ish types used by Pimlico's `pm_getPaymasterData`. Some
// paymaster providers accept a `context` blob (token, sponsorship policy,
// ...); we forward it verbatim.
export const encodePaymasterContext = (context: Record<string, unknown>): `0x${string}` =>
  encodeAbiParameters(
    [{ type: 'bytes' }],
    [`0x${Buffer.from(JSON.stringify(context)).toString('hex')}` as `0x${string}`]
  )
