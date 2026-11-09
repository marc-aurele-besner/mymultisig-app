import { isRpcError, rpcSettingsHref } from './rpcError'

describe('isRpcError', () => {
  it('detects viem transport errors by name, including nested causes', () => {
    expect(isRpcError({ name: 'HttpRequestError', message: 'HTTP request failed.' })).toBe(true)
    expect(isRpcError({ name: 'ContractFunctionExecutionError', cause: { name: 'TimeoutError' } })).toBe(true)
  })

  it('detects rate limits and network failures by message', () => {
    expect(isRpcError({ status: 429 })).toBe(true)
    expect(isRpcError(new TypeError('Failed to fetch'))).toBe(true)
    expect(isRpcError({ details: '503 Service Unavailable' })).toBe(true)
  })

  it('ignores contract reverts and wallet rejections', () => {
    expect(isRpcError({ name: 'ContractFunctionRevertedError', message: 'NotOwner()' })).toBe(false)
    expect(isRpcError({ name: 'UserRejectedRequestError', message: 'User rejected the request.' })).toBe(false)
    expect(isRpcError(null)).toBe(false)
  })
})

describe('rpcSettingsHref', () => {
  it('links to the multisig section when a multisig is open', () => {
    expect(rpcSettingsHref('0xabc')).toBe('/multisig/0xabc/settings#rpc')
    expect(rpcSettingsHref(null)).toBe('/settings/rpc')
  })
})
