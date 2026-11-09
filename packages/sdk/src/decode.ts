import { decodeFunctionData, erc20Abi, formatEther, maxUint256, type Abi } from 'viem'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'

type Address = `0x${string}`

export type DecodedCall = {
  kind: 'native-transfer' | 'wallet-admin' | 'erc20' | 'contract-call'
  summary: string
  functionName?: string
  args?: readonly unknown[]
  // Things a reviewer (human or agent) should look at before signing.
  warnings: string[]
}

// Self-calls that change who controls the wallet or how many signatures it needs.
const CONTROL_FUNCTIONS = new Set([
  'addOwner',
  'removeOwner',
  'replaceOwner',
  'changeThreshold',
  'takeOverOwnership',
  'setOwnerSettings',
  'setTransferInactiveOwnershipAfter',
  'setOnlyOwnerRequest',
  'incrementNonce',
  'disableAllowlist',
  'setAllowedTarget',
  'setDailySpendingLimit',
  'setSensitiveSelector',
  'setSensitiveValueThreshold'
])

const stringify = (value: unknown): string =>
  typeof value === 'bigint' ? value.toString() : Array.isArray(value) ? `[${value.map(stringify).join(', ')}]` : String(value)

// Best-effort, offline description of what a request does. Never a substitute
// for simulating it, but enough to flag the obviously dangerous shapes.
export const describeCall = (
  wallet: Address,
  request: { to: Address; value: string; data: `0x${string}`; operation?: string }
): DecodedCall => {
  const warnings: string[] = []
  const value = BigInt(/^\d+$/.test(request.value ?? '') ? request.value : '0')
  const valueText = value > 0n ? ` and sends ${formatEther(value)} native token` : ''
  if (request.operation === '1')
    warnings.push('DELEGATECALL: the target code runs with the wallet’s own storage and balance.')

  if (request.data === '0x' || request.data == null || request.data === ('' as `0x${string}`)) {
    return {
      kind: 'native-transfer',
      summary: `Transfer ${formatEther(value)} native token to ${request.to}`,
      warnings
    }
  }

  if (request.to.toLowerCase() === wallet.toLowerCase()) {
    try {
      const { functionName, args } = decodeFunctionData({ abi: MyMultiSigExtended as Abi, data: request.data })
      if (CONTROL_FUNCTIONS.has(functionName))
        warnings.push(`Changes wallet control or security settings (${functionName}).`)
      return {
        kind: 'wallet-admin',
        summary: `Wallet self-call ${functionName}(${(args ?? []).map(stringify).join(', ')})${valueText}`,
        functionName,
        args,
        warnings
      }
    } catch {
      warnings.push('Self-call with calldata that does not match the wallet ABI.')
    }
  }

  try {
    const { functionName, args } = decodeFunctionData({ abi: erc20Abi, data: request.data })
    if (functionName === 'approve' && (args?.[1] as bigint) === maxUint256)
      warnings.push('Unlimited ERC-20 approval.')
    if (functionName === 'approve' || functionName === 'transfer' || functionName === 'transferFrom')
      return {
        kind: 'erc20',
        summary: `ERC-20 ${functionName}(${(args ?? []).map(stringify).join(', ')}) on token ${request.to}${valueText}`,
        functionName,
        args,
        warnings
      }
  } catch {
    // not an ERC-20 call
  }

  return {
    kind: 'contract-call',
    summary: `Call ${request.to} with selector ${request.data.slice(0, 10)}${valueText}`,
    warnings
  }
}
