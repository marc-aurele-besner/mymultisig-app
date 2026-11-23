import { describeConnectError, isProviderNotFound } from './walletError'

const named = (name: string, message: string, extra: Record<string, unknown> = {}) =>
  Object.assign(new Error(message), { name, ...extra })

describe('isProviderNotFound', () => {
  it('matches wagmi ProviderNotFoundError by name or message', () => {
    expect(isProviderNotFound(named('ProviderNotFoundError', 'Provider not found.'))).toBe(true)
    expect(isProviderNotFound(new Error('Provider not found.\n\nVersion: @wagmi/core@3.6.9'))).toBe(true)
    expect(isProviderNotFound(new Error('Something else'))).toBe(false)
    expect(isProviderNotFound(null)).toBe(false)
  })
})

describe('describeConnectError', () => {
  it('never shows the library version', () => {
    const error = named('ProviderNotFoundError', 'Provider not found.\n\nVersion: @wagmi/core@3.6.9', {
      shortMessage: 'Provider not found.'
    })
    expect(describeConnectError(error)).toBe('No wallet app was found in this browser.')
  })

  it('strips version and docs lines from unknown errors', () => {
    const error = named('SomeError', 'Wallet exploded.\n\nDocs: https://wagmi.sh\nVersion: @wagmi/core@3.6.9')
    expect(describeConnectError(error)).toBe('Wallet exploded.')
    expect(describeConnectError(new Error('Odd thing. Version: @wagmi/core@3.6.9'))).toBe('Odd thing.')
  })

  it('maps rejection, pending and already-connected errors to plain language', () => {
    expect(describeConnectError(Object.assign(new Error('User rejected the request.'), { code: 4001 }))).toMatch(
      /closed the wallet prompt/
    )
    expect(describeConnectError(Object.assign(new Error('x'), { code: -32002 }))).toMatch(/already has a request/)
    expect(describeConnectError(named('ConnectorAlreadyConnectedError', 'Connector already connected.'))).toBe(
      'This wallet is already connected.'
    )
  })

  it('falls back to a generic sentence', () => {
    expect(describeConnectError(new Error('Version: @wagmi/core@3.6.9'))).toMatch(/Something went wrong/)
    expect(describeConnectError(undefined)).toMatch(/Something went wrong/)
  })
})
