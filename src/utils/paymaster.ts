import { PackedUserOp, userOpToJson } from './userOp'

// Pimlico-style paymaster client. The endpoint is a JSON-RPC service that
// fronts `pm_getPaymasterData`. If no paymasterUrl is configured, the
// caller falls back to the wallet's own EntryPoint deposit (paymasterAndData
// = '0x') and the bundler/EntryPoint handles the prefund.

export type PaymasterData = {
  paymasterAndData: `0x${string}`
  // Some paymasters also return updated gas estimates; the caller may apply
  // them to the UserOp before sending.
  callGasLimit?: string
  preVerificationGas?: string
  verificationGasLimit?: string
}

export type PmGetPaymasterDataParams = {
  userOp: PackedUserOp
  entryPoint: `0x${string}`
  // Pimlico's optional context: sponsorship policy id, token address for
  // ERC-20 paymasters, etc. Forwarded verbatim.
  context?: Record<string, unknown>
}

const rpcCall = async <T>(url: string, method: string, params: unknown[]): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  })
  if (!response.ok) throw new Error(`Paymaster ${method} failed: HTTP ${response.status}`)
  const body = (await response.json()) as { result?: T; error?: { message?: string; code?: number; data?: unknown } }
  if (body.error != null) {
    throw new Error(body.error.message ?? `Paymaster ${method} rejected`)
  }
  if (body.result == null) throw new Error(`Paymaster ${method} returned no result`)
  return body.result
}

export const pmGetPaymasterData = async (
  paymasterUrl: string,
  params: PmGetPaymasterDataParams
): Promise<PaymasterData> => {
  const { userOp, entryPoint, context } = params
  const args: unknown[] = [{ ...userOpToJson(userOp), signature: '0x' }, entryPoint]
  if (context != null) args.push(context)
  return rpcCall<PaymasterData>(paymasterUrl, 'pm_getPaymasterData', args)
}
