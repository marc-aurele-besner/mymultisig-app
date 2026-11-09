import { describe, expect, it } from 'vitest'
import { parseSiweMessage } from 'viem/siwe'
import { privateKeyToAccount } from 'viem/accounts'

import { ApiClient, ApiError } from '../src/api'

const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')

type Call = { url: string; init: RequestInit }

const fakeFetch = (handler: (call: Call) => Response) => {
  const calls: Call[] = []
  const impl = (async (url: string, init: RequestInit) => {
    const call = { url, init }
    calls.push(call)
    return handler(call)
  }) as unknown as typeof fetch
  return { impl, calls }
}

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' }, ...init })

describe('ApiClient', () => {
  it('sends the API key as a Bearer token', async () => {
    const { impl, calls } = fakeFetch(() => json({ content: [], walletNonce: 2 }))
    const api = new ApiClient({ baseUrl: 'https://example.test/', apiKey: 'mms_abc', fetch: impl })
    const res = await api.listRequests('0xabc')
    expect(res.walletNonce).toBe(2)
    expect(calls[0].url).toBe('https://example.test/api/multisig-requests?multiSigAddress=0xabc')
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('Bearer mms_abc')
  })

  it('performs SIWE login and replays the session cookie', async () => {
    const { impl, calls } = fakeFetch(({ url }) => {
      if (url.endsWith('/api/siwe/nonce'))
        return new Response(JSON.stringify({ nonce: 'abcdef123456' }), {
          headers: { 'set-cookie': 'siwe-nonce=n1; Path=/; HttpOnly' }
        })
      if (url.endsWith('/api/siwe/verify'))
        return new Response(JSON.stringify({ address: account.address.toLowerCase() }), {
          headers: { 'set-cookie': 'siwe-session=s1; Path=/; HttpOnly' }
        })
      return json({ content: [] })
    })
    const api = new ApiClient({ baseUrl: 'https://mymultisig.example', fetch: impl })
    await api.siweLogin(account)
    expect(api.hasSession).toBe(true)
    const verify = calls[1]
    expect((verify.init.headers as Record<string, string>).Cookie).toBe('siwe-nonce=n1')
    const { message } = JSON.parse(String(verify.init.body))
    const parsed = parseSiweMessage(message)
    expect(parsed.domain).toBe('mymultisig.example')
    expect(parsed.nonce).toBe('abcdef123456')
    expect(parsed.address).toBe(account.address)
    await api.listWallets('0x1')
    expect((calls[2].init.headers as Record<string, string>).Cookie).toContain('siwe-session=s1')
  })

  it('unwraps the single-row array GET /api/multisig-requests/[id] returns', async () => {
    const { impl } = fakeFetch(() => json({ message: 'Data retrieved', content: [{ id: 'r1', description: 'x' }] }))
    const api = new ApiClient({ baseUrl: 'https://example.test', fetch: impl })
    expect((await api.getRequest('r1')).id).toBe('r1')
  })

  it('throws ApiError with the server message', async () => {
    const { impl } = fakeFetch(() => json({ message: 'Only an owner of this wallet can modify this request' }, { status: 403 }))
    const api = new ApiClient({ baseUrl: 'https://example.test', fetch: impl })
    await expect(api.cancelRequest('id')).rejects.toMatchObject({ status: 403, name: 'ApiError' })
    await expect(api.cancelRequest('id')).rejects.toBeInstanceOf(ApiError)
  })
})
