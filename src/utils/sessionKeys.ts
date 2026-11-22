import { encodeFunctionData } from 'viem'

import { SESSION_KEY_MODULE_ADDRESS, sessionKeyModuleAbi } from '../constants/abi/sessionKeyModule'

// Pure rules behind the session-key grant form. A grant is a threshold-signed
// call from the wallet to SessionKeyModule.grantSessionKey; the key holder then
// calls executeWithSessionKey directly with no other signatures.

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)
const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

// Calldata shorter than 4 bytes (a plain native transfer) matches this
// selector, which has to be allowed explicitly once selectors are restricted.
export const PLAIN_TRANSFER_SELECTOR = '0x00000000'

// ERC-20 entry points that move or unlock token balances. ethBudget never
// meters them, so a key allowed to call one of these on a token target can
// move that token without limit.
export const TOKEN_MOVING_SELECTORS: { selector: `0x${string}`; label: string }[] = [
  { selector: '0xa9059cbb', label: 'transfer(address,uint256)' },
  { selector: '0x095ea7b3', label: 'approve(address,uint256)' },
  { selector: '0x23b872dd', label: 'transferFrom(address,address,uint256)' },
  { selector: '0x39509351', label: 'increaseAllowance(address,uint256)' },
  { selector: '0xd505accf', label: 'permit(address,address,uint256,uint256,uint8,bytes32,bytes32)' }
]

export type TargetContext = {
  wallet: string
  // Modules currently enabled on the wallet (getModules()).
  modules: readonly string[]
}

// Why `target` cannot be a session target, or null when it can. The module
// rejects the wallet and itself at grant time and refuses any enabled module
// at execution time, so offering them would only produce a dead or reverting
// grant.
export const sessionTargetError = (target: string, ctx: TargetContext): string | null => {
  if (!isAddress(target)) return 'Enter a valid contract address'
  if (same(target, ZERO_ADDRESS)) return 'The zero address cannot be a target'
  if (same(target, ctx.wallet)) return 'A session key can never call the wallet itself'
  if (same(target, SESSION_KEY_MODULE_ADDRESS)) return 'A session key can never call the session-key module'
  if (ctx.modules.some((m) => same(m, target)))
    return 'This address is a module enabled on the wallet; session keys cannot call modules'
  return null
}

// Address-book entries / suggestions that may be offered in the target picker.
export const isPickableTarget = (address: string, ctx: TargetContext) => sessionTargetError(address, ctx) == null

export type TokenRisk = 'unrestricted' | 'token-moving-selectors' | null

// How exposed a token target is, given the grant's selector set. Selector
// restrictions apply to every target of the grant at once.
export const tokenTargetRisk = (selectors: readonly string[]): TokenRisk => {
  if (selectors.length === 0) return 'unrestricted'
  if (selectors.some((s) => TOKEN_MOVING_SELECTORS.some((t) => same(t.selector, s)))) return 'token-moving-selectors'
  return null
}

export type GrantInput = {
  key: string
  // Unix seconds; 0 = active immediately.
  validAfter: number
  validUntil: number
  ethBudgetWei: string
  targets: string[]
  selectors: string[]
}

export const grantError = (input: GrantInput, ctx: TargetContext, nowSeconds: number): string | null => {
  if (!isAddress(input.key) || same(input.key, ZERO_ADDRESS)) return 'Enter the session key address'
  if (same(input.key, ctx.wallet)) return 'The session key must be a separate address, not the wallet'
  if (!Number.isFinite(input.validUntil) || input.validUntil <= nowSeconds) return 'Pick an expiry in the future'
  if (input.validAfter >= input.validUntil) return 'The key must start before it expires'
  if (!/^\d+$/.test(input.ethBudgetWei)) return 'Enter a budget (0 for none)'
  if (input.targets.length === 0) return 'Add at least one target contract'
  const seen = new Set<string>()
  for (const target of input.targets) {
    const error = sessionTargetError(target, ctx)
    if (error != null) return `${target}: ${error}`
    if (seen.has(target.toLowerCase())) return `${target} is listed twice`
    seen.add(target.toLowerCase())
  }
  if (input.selectors.some((s) => !/^0x[a-fA-F0-9]{8}$/.test(s))) return 'Selectors must be 4-byte hex like 0xa9059cbb'
  return null
}

export const encodeGrantSessionKey = (input: GrantInput): `0x${string}` =>
  encodeFunctionData({
    abi: sessionKeyModuleAbi,
    functionName: 'grantSessionKey',
    args: [
      input.key as `0x${string}`,
      input.validAfter,
      input.validUntil,
      BigInt(input.ethBudgetWei),
      input.targets as `0x${string}`[],
      input.selectors as `0x${string}`[]
    ]
  })

// A grant writes the key record plus one cold slot per target and selector.
export const grantGas = (targets: number, selectors: number) => String(120_000 + 30_000 * (targets + selectors))

export type SessionKeyRecord = {
  validAfter: number
  validUntil: number
  ethBudget: bigint
  ethSpent: bigint
  restrictSelectors: boolean
}

export type SessionKeyStatus = 'none' | 'scheduled' | 'active' | 'expired'

export const sessionKeyStatus = (record: SessionKeyRecord | undefined, nowSeconds: number): SessionKeyStatus => {
  if (record == null || record.validUntil === 0) return 'none'
  if (nowSeconds > record.validUntil) return 'expired'
  if (nowSeconds < record.validAfter) return 'scheduled'
  return 'active'
}
