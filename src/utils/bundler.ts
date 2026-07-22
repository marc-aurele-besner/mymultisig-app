import { PackedUserOpJson } from '../models/MultiSigs'
import { PackedUserOp, userOpToJson } from './userOp'

// Thin JSON-RPC wrapper around the ERC-4337 bundler methods. The app
// intentionally avoids pulling in `viem/account-abstraction` so the codec
// stays explicit and the dep surface is contained; a bundler is just a JSON
// endpoint that speaks a handful of extra methods on top of the standard
// Ethereum JSON-RPC.

export type UserOpReceiptJson = {
  userOpHash: `0x${string}`
  sender: `0x${string}`
  nonce: string
  paymaster?: `0x${string}`
  actualGasCost: string
  actualGasUsed: string
  success: boolean
  reason?: string
  receipt: {
    blockHash: `0x${string}`
    blockNumber: `0x${string}`
    transactionHash: `0x${string}`
    logs: unknown[]
  }
}

export type UserOpGasEstimation = {
  callGasLimit: string
  verificationGasLimit: string
  preVerificationGas: string
  paymasterAndData?: `0x${string}`
}

export class BundlerRpcError extends Error {
  readonly code: number
  readonly data: unknown
  constructor(message: string, code: number, data: unknown) {
    super(message)
    this.code = code
    this.data = data
  }
}

const rpcCall = async <T>(url: string, method: string, params: unknown[]): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  })
  if (!response.ok) throw new Error(`Bundler ${method} failed: HTTP ${response.status}`)
  const body = (await response.json()) as { result?: T; error?: { message?: string; code?: number; data?: unknown } }
  if (body.error != null) {
    throw new BundlerRpcError(
      body.error.message ?? `Bundler ${method} rejected`,
      body.error.code ?? -32000,
      body.error.data
    )
  }
  if (body.result == null) throw new Error(`Bundler ${method} returned no result`)
  return body.result
}

export const supportedEntryPoints = async (bundlerUrl: string): Promise<`0x${string}`[]> =>
  rpcCall<`0x${string}`[]>(bundlerUrl, 'eth_supportedEntryPoints', [])

export const sendUserOperation = async (
  bundlerUrl: string,
  op: PackedUserOp,
  entryPoint: `0x${string}`
): Promise<`0x${string}`> => rpcCall<`0x${string}`>(bundlerUrl, 'eth_sendUserOperation', [userOpToJson(op), entryPoint])

export const estimateUserOperationGas = async (
  bundlerUrl: string,
  op: PackedUserOp,
  entryPoint: `0x${string}`
): Promise<UserOpGasEstimation> =>
  rpcCall<UserOpGasEstimation>(bundlerUrl, 'eth_estimateUserOperationGas', [
    { ...userOpToJson(op), signature: '0x' },
    entryPoint
  ])

export const getUserOperationByHash = async (
  bundlerUrl: string,
  hash: `0x${string}`
): Promise<UserOpReceiptJson | null> =>
  rpcCall<UserOpReceiptJson | null>(bundlerUrl, 'eth_getUserOperationByHash', [hash])

export const getUserOperationReceipt = async (
  bundlerUrl: string,
  hash: `0x${string}`
): Promise<UserOpReceiptJson | null> =>
  rpcCall<UserOpReceiptJson | null>(bundlerUrl, 'eth_getUserOperationReceipt', [hash])

export const waitForUserOperationReceipt = async (
  bundlerUrl: string,
  hash: `0x${string}`,
  { timeout = 120_000, interval = 2_000 }: { timeout?: number; interval?: number } = {}
): Promise<UserOpReceiptJson> => {
  const deadline = Date.now() + timeout
   
  while (true) {
    const receipt = await getUserOperationReceipt(bundlerUrl, hash)
    if (receipt != null) return receipt
    if (Date.now() > deadline) throw new Error(`Bundler receipt for ${hash} did not arrive within ${timeout}ms`)
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
}

// Convenience: validate the userOpJson shape against the canonical PackedUserOp
// tuple so dev-time mistakes surface early.
export const assertUserOpJsonShape = (value: unknown): PackedUserOpJson => {
  if (typeof value !== 'object' || value === null) throw new Error('userOpJson must be an object')
  const rec = value as Record<string, unknown>
  for (const key of [
    'sender',
    'nonce',
    'initCode',
    'callData',
    'accountGasLimits',
    'preVerificationGas',
    'gasFees',
    'paymasterAndData',
    'signature'
  ]) {
    if (typeof rec[key] !== 'string') throw new Error(`userOpJson.${key} must be a hex string`)
  }
  return rec as unknown as PackedUserOpJson
}
