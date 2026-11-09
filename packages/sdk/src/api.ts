import type { LocalAccount } from 'viem'
import { createSiweMessage } from 'viem/siwe'

import type { ApiKeyInfo, ApiKeyScope, StoredRequest, StoredWallet } from './types'

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export type ApiClientOptions = {
  // e.g. https://mymultisig.app (no trailing slash needed)
  baseUrl: string
  // `mms_…` key minted at /settings/agents. Sent as a Bearer token.
  apiKey?: string
  fetch?: typeof fetch
}

const encode = encodeURIComponent

// Thin typed client for the mymultisig.app REST API (see /openapi.json).
// Auth is either a Bearer API key or a SIWE session obtained with a local
// account (`siweLogin`), whose cookie is kept in memory for this instance.
export class ApiClient {
  readonly baseUrl: string
  private readonly apiKey?: string
  private readonly fetchImpl: typeof fetch
  private readonly cookies = new Map<string, string>()

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '')
    this.apiKey = options.apiKey
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis)
  }

  get hasSession(): boolean {
    return this.cookies.has('siwe-session')
  }

  get hasApiKey(): boolean {
    return this.apiKey != null && this.apiKey !== ''
  }

  private storeCookies(response: Response) {
    const headers = response.headers as Headers & { getSetCookie?: () => string[] }
    const setCookies = headers.getSetCookie?.() ?? (response.headers.get('set-cookie') ? [response.headers.get('set-cookie')!] : [])
    for (const raw of setCookies) {
      const [pair, ...attributes] = raw.split(';')
      const eq = pair.indexOf('=')
      if (eq < 0) continue
      const name = pair.slice(0, eq).trim()
      const value = pair.slice(eq + 1).trim()
      const expired = attributes.some((a) => /^\s*max-age=0\s*$/i.test(a))
      if (value === '' || expired) this.cookies.delete(name)
      else this.cookies.set(name, value)
    }
  }

  async request<T>(method: string, path: string, body?: unknown, init: { rawBody?: string } = {}): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`
    if (this.cookies.size > 0)
      headers.Cookie = [...this.cookies.entries()].map(([name, value]) => `${name}=${value}`).join('; ')
    let payload: string | undefined
    if (init.rawBody != null) {
      headers['Content-Type'] = 'text/plain'
      payload = init.rawBody
    } else if (body !== undefined) {
      headers['Content-Type'] = 'application/json'
      payload = JSON.stringify(body)
    }
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, { method, headers, body: payload })
    this.storeCookies(response)
    const text = await response.text()
    let parsed: unknown = undefined
    try {
      parsed = text ? JSON.parse(text) : undefined
    } catch {
      parsed = text
    }
    if (!response.ok) {
      const message =
        (parsed as { message?: string } | undefined)?.message ?? `${method} ${path} failed with status ${response.status}`
      throw new ApiError(response.status, message, parsed)
    }
    return parsed as T
  }

  // --- Auth ---------------------------------------------------------------

  // Sign-In with Ethereum using a local key: GET nonce -> sign EIP-4361
  // message bound to the API host -> POST verify. The session cookie lasts 7
  // days and is kept in memory on this client.
  async siweLogin(account: LocalAccount, statement = 'Sign in to MyMultiSig'): Promise<string> {
    const { nonce } = await this.request<{ nonce: string }>('GET', '/api/siwe/nonce')
    const url = new URL(this.baseUrl)
    const message = createSiweMessage({
      domain: url.host,
      address: account.address,
      statement,
      uri: url.origin,
      version: '1',
      chainId: 1,
      nonce,
      issuedAt: new Date()
    })
    const signature = await account.signMessage({ message })
    // The verify route parses a raw JSON string body (text/plain keeps
    // Next.js from pre-parsing it on servers that predate parseBody there).
    const { address } = await this.request<{ address: string }>('POST', '/api/siwe/verify', undefined, {
      rawBody: JSON.stringify({ message, signature })
    })
    return address
  }

  async session(): Promise<string | null> {
    const { address } = await this.request<{ address: string | null }>('GET', '/api/siwe/session')
    return address
  }

  // The address the current credentials act as (API key owner or SIWE wallet).
  async whoami(): Promise<{ address: string | null; via: 'apikey' | 'siwe' | null; scopes: ApiKeyScope[] }> {
    return this.request('GET', '/api/agent-keys/whoami')
  }

  // --- Requests -------------------------------------------------------------

  async listRequests(multiSigAddress: string): Promise<{ requests: StoredRequest[]; walletNonce: number | null }> {
    const res = await this.request<{ content: StoredRequest[]; walletNonce: number | null }>(
      'GET',
      `/api/multisig-requests?multiSigAddress=${encode(multiSigAddress)}`
    )
    return { requests: res.content ?? [], walletNonce: res.walletNonce ?? null }
  }

  async getRequest(id: string): Promise<StoredRequest> {
    // The route wraps the single row in an array: { content: [request] }.
    const res = await this.request<{ content: StoredRequest[] | StoredRequest }>(
      'GET',
      `/api/multisig-requests/${encode(id)}`
    )
    const request = Array.isArray(res.content) ? res.content[0] : res.content
    if (request == null) throw new ApiError(404, `Request ${id} not found`)
    return request
  }

  async addRequest(record: StoredRequest): Promise<{ id: string }> {
    const res = await this.request<{ content?: { id: string } }>('POST', '/api/multisig-requests', record)
    return { id: res.content?.id ?? record.id }
  }

  patchRequest(id: string, patch: Partial<StoredRequest>): Promise<unknown> {
    return this.request('PATCH', `/api/multisig-requests/${encode(id)}`, patch)
  }

  cancelRequest(id: string): Promise<unknown> {
    return this.request('POST', `/api/multisig-requests/${encode(id)}/cancel`, {})
  }

  resetRequest(id: string): Promise<unknown> {
    return this.request('POST', `/api/multisig-requests/${encode(id)}/reset`, {})
  }

  deleteRequest(id: string): Promise<unknown> {
    return this.request('DELETE', `/api/multisig-requests/${encode(id)}`, {})
  }

  // --- Wallets ----------------------------------------------------------------

  async listWallets(ownerAddress: string): Promise<StoredWallet[]> {
    const res = await this.request<{ content: StoredWallet[] }>(
      'GET',
      `/api/multisig-wallets?ownerAddress=${encode(ownerAddress)}`
    )
    return res.content ?? []
  }

  upsertWallet(wallet: StoredWallet): Promise<unknown> {
    return this.request('POST', '/api/multisig-wallets', wallet)
  }

  // --- Assets -----------------------------------------------------------------

  getAssets(address: string, chainId: number): Promise<unknown> {
    return this.request('POST', '/api/get-assets', { address, chainId })
  }

  // --- API keys (SIWE session only: a key can never mint keys) ---------------

  async listApiKeys(): Promise<ApiKeyInfo[]> {
    const res = await this.request<{ content: ApiKeyInfo[] }>('GET', '/api/agent-keys')
    return res.content ?? []
  }

  async createApiKey(input: {
    name: string
    scopes: ApiKeyScope[]
    walletAddresses?: string[]
    expiresInDays?: number | null
  }): Promise<{ key: string; info: ApiKeyInfo }> {
    const res = await this.request<{ content: { key: string; info: ApiKeyInfo } }>('POST', '/api/agent-keys', input)
    return res.content
  }

  revokeApiKey(id: string): Promise<unknown> {
    return this.request('DELETE', `/api/agent-keys/${encode(id)}`)
  }
}
