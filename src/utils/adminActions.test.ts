import { decodeFunctionData, Abi } from 'viem'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'

import {
  ADMIN_ACTIONS,
  ALLOWLIST_LOCKOUT_MESSAGE,
  AdminActionContext,
  buildAdminRequest,
  validateAdminAction
} from './adminActions'

const abi = MyMultiSigExtended as Abi
const WALLET = '0x1111111111111111111111111111111111111111'
const BOB = '0x2222222222222222222222222222222222222222'

const action = (id: string) => {
  const found = ADMIN_ACTIONS.find((a) => a.id === id)
  if (!found) throw new Error(`missing action ${id}`)
  return found
}
const setAllowedTarget = action('setAllowedTarget')
const disableAllowlist = action('disableAllowlist')
const addOwner = action('addOwner')

const ctx = (over: Partial<AdminActionContext> = {}): AdminActionContext => ({
  threshold: 1,
  ownerCount: 2,
  walletAddress: WALLET,
  allowlistEnabled: false,
  selfAllowed: false,
  ...over
})

describe('setAllowedTarget lockout protection', () => {
  it('bundles allowing the wallet itself with the first allowed target', () => {
    const values = { target: BOB, allowed: 'true' }
    expect(validateAdminAction(setAllowedTarget, values, ctx())).toBeNull()

    const request = buildAdminRequest(setAllowedTarget, values, ctx())
    const decoded = decodeFunctionData({ abi, data: request.data })
    expect(decoded.functionName).toBe('multiRequestStrict')
    const [to, value, data] = decoded.args as [string[], bigint[], `0x${string}`[], bigint[]]
    expect(to.map((a) => a.toLowerCase())).toEqual([WALLET, WALLET])
    expect(value).toEqual([0n, 0n])

    // The wallet must be allowed before (or with) the other target.
    const inner = data.map((d) => decodeFunctionData({ abi, data: d }))
    expect(inner[0].functionName).toBe('setAllowedTarget')
    expect((inner[0].args?.[0] as string).toLowerCase()).toBe(WALLET)
    expect(inner[0].args?.[1]).toBe(true)
    expect((inner[1].args?.[0] as string).toLowerCase()).toBe(BOB)
    expect(inner[1].args?.[1]).toBe(true)
    expect(request.txnGas).toBeDefined()
  })

  it('sends a plain call once the wallet is already on its allowlist', () => {
    const request = buildAdminRequest(
      setAllowedTarget,
      { target: BOB, allowed: 'true' },
      ctx({ allowlistEnabled: true, selfAllowed: true })
    )
    expect(decodeFunctionData({ abi, data: request.data }).functionName).toBe('setAllowedTarget')
  })

  it('sends a plain call when allowing the wallet itself', () => {
    const request = buildAdminRequest(setAllowedTarget, { target: WALLET, allowed: 'true' }, ctx())
    expect(decodeFunctionData({ abi, data: request.data }).functionName).toBe('setAllowedTarget')
  })

  it('refuses to remove the wallet from its own active allowlist', () => {
    expect(
      validateAdminAction(
        setAllowedTarget,
        { target: WALLET, allowed: 'false' },
        ctx({ allowlistEnabled: true, selfAllowed: true })
      )
    ).toMatch(/lock it out/)
  })

  it('waits for the allowlist state before allowing a target', () => {
    expect(
      validateAdminAction(setAllowedTarget, { target: BOB, allowed: 'true' }, ctx({ selfAllowed: undefined }))
    ).not.toBeNull()
  })

  it('blocks every admin action on a wallet that is already locked out', () => {
    const locked = ctx({ allowlistEnabled: true, selfAllowed: false })
    expect(validateAdminAction(disableAllowlist, {}, locked)).toBe(ALLOWLIST_LOCKOUT_MESSAGE)
    expect(validateAdminAction(addOwner, { owner: BOB }, locked)).toBe(ALLOWLIST_LOCKOUT_MESSAGE)
    expect(validateAdminAction(addOwner, { owner: BOB }, ctx())).toBeNull()
  })
})
