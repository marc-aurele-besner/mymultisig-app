import { decodeFunctionData, getContractAddress, keccak256, toFunctionSelector } from 'viem'

import {
  CANONICAL_CREATE2_DEPLOYER,
  SESSION_KEY_MODULE_ADDRESS,
  SESSION_KEY_MODULE_INIT_CODE,
  SESSION_KEY_MODULE_SALT,
  sessionKeyModuleAbi
} from '../constants/abi/sessionKeyModule'
import {
  TOKEN_MOVING_SELECTORS,
  encodeGrantSessionKey,
  grantError,
  sessionKeyStatus,
  sessionTargetError,
  tokenTargetRisk
} from './sessionKeys'

const WALLET = '0x1111111111111111111111111111111111111111'
const OTHER_MODULE = '0x2222222222222222222222222222222222222222'
const TARGET = '0x3333333333333333333333333333333333333333'
const KEY = '0x4444444444444444444444444444444444444444'
const ctx = { wallet: WALLET, modules: [OTHER_MODULE] }

describe('session-key module release constants', () => {
  it('derive the module address from the canonical deployer, salt and init code', () => {
    expect(
      getContractAddress({
        opcode: 'CREATE2',
        from: CANONICAL_CREATE2_DEPLOYER,
        salt: SESSION_KEY_MODULE_SALT,
        bytecodeHash: keccak256(SESSION_KEY_MODULE_INIT_CODE)
      })
    ).toBe(SESSION_KEY_MODULE_ADDRESS)
  })
})

describe('sessionTargetError', () => {
  it('accepts an ordinary contract', () => {
    expect(sessionTargetError(TARGET, ctx)).toBeNull()
  })

  it('rejects the wallet, the session-key module and any enabled module', () => {
    expect(sessionTargetError(WALLET, ctx)).toMatch(/wallet itself/)
    expect(sessionTargetError(SESSION_KEY_MODULE_ADDRESS.toLowerCase(), ctx)).toMatch(/session-key module/)
    expect(sessionTargetError(OTHER_MODULE.toUpperCase().replace('0X', '0x'), ctx)).toMatch(/module enabled/)
  })

  it('rejects malformed and zero addresses', () => {
    expect(sessionTargetError('0x12', ctx)).not.toBeNull()
    expect(sessionTargetError('0x0000000000000000000000000000000000000000', ctx)).not.toBeNull()
  })
})

describe('tokenTargetRisk', () => {
  it('flags grants without selector restrictions', () => {
    expect(tokenTargetRisk([])).toBe('unrestricted')
  })

  it('flags restricted grants that still allow token-moving functions', () => {
    expect(tokenTargetRisk(['0xA9059CBB'])).toBe('token-moving-selectors')
  })

  it('clears grants restricted to other functions', () => {
    expect(tokenTargetRisk(['0x00000000', '0x12345678'])).toBeNull()
  })

  it('lists the real ERC-20 selectors', () => {
    for (const { selector, label } of TOKEN_MOVING_SELECTORS) {
      expect(toFunctionSelector(`function ${label}`)).toBe(selector)
    }
  })
})

describe('grantError', () => {
  const base = {
    key: KEY,
    validAfter: 0,
    validUntil: 2_000,
    ethBudgetWei: '1000',
    targets: [TARGET],
    selectors: []
  }

  it('accepts a well-formed grant', () => {
    expect(grantError(base, ctx, 1_000)).toBeNull()
  })

  it('rejects an expiry in the past and a start after the expiry', () => {
    expect(grantError({ ...base, validUntil: 999 }, ctx, 1_000)).toMatch(/future/)
    expect(grantError({ ...base, validAfter: 2_000 }, ctx, 1_000)).toMatch(/start before/)
  })

  it('rejects a grant without targets, with a forbidden target or a duplicate', () => {
    expect(grantError({ ...base, targets: [] }, ctx, 1_000)).toMatch(/at least one/)
    expect(grantError({ ...base, targets: [TARGET, OTHER_MODULE] }, ctx, 1_000)).toMatch(/module enabled/)
    expect(grantError({ ...base, targets: [TARGET, TARGET.toUpperCase().replace('0X', '0x')] }, ctx, 1_000)).toMatch(
      /twice/
    )
  })
})

describe('encodeGrantSessionKey', () => {
  it('encodes grantSessionKey with the form values', () => {
    const data = encodeGrantSessionKey({ ...base(), selectors: ['0xa9059cbb'] })
    const decoded = decodeFunctionData({ abi: sessionKeyModuleAbi, data })
    expect(decoded.functionName).toBe('grantSessionKey')
    expect(decoded.args).toEqual([KEY, 10, 20, 5n, [TARGET], ['0xa9059cbb']])
  })

  function base() {
    return { key: KEY, validAfter: 10, validUntil: 20, ethBudgetWei: '5', targets: [TARGET], selectors: [] }
  }
})

describe('sessionKeyStatus', () => {
  const record = { validAfter: 100, validUntil: 200, ethBudget: 0n, ethSpent: 0n, restrictSelectors: false }
  it('follows the time window', () => {
    expect(sessionKeyStatus(undefined, 150)).toBe('none')
    expect(sessionKeyStatus({ ...record, validUntil: 0 }, 150)).toBe('none')
    expect(sessionKeyStatus(record, 50)).toBe('scheduled')
    expect(sessionKeyStatus(record, 150)).toBe('active')
    expect(sessionKeyStatus(record, 201)).toBe('expired')
  })
})
