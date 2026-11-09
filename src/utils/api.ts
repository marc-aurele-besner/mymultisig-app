import { toast } from 'sonner'

import { MultiSig, MultiSigTransactionRequest } from '../models/MultiSigs'
import type { IncomingTransfersPage } from '../lib/alchemy/transfers'

// Content routes reject callers without a SIWE session (401). Surface that
// once instead of letting fire-and-forget writes fail silently — every new
// dedicated helper runs through this so the toast stays consistent.
let lastAuthToast = 0
const handleContentResponse = (response: Response) => {
  if (response.status === 401 && Date.now() - lastAuthToast > 30_000) {
    lastAuthToast = Date.now()
    toast.error('Wallet not verified — reconnect your wallet and sign the sign-in message to sync your data.')
  }
  return response.json()
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

// Single fetch path for every new helper so the 401 toast handler stays
// in one place. `body` is serialised once; callers pass plain objects.
const fetchJson = (url: string, init: RequestInit = {}) => fetch(url, init).then(handleContentResponse)

// Writes that the user is waiting on must not look saved when the server
// refused them (403 owner-only wallet, 500 from a failed INSERT, ...).
const fetchWrite = async (url: string, init: RequestInit) => {
  const response = await fetch(url, init)
  const body = (await handleContentResponse(response)) as { message?: string }
  if (!response.ok) throw new Error(body?.message ?? `Request failed with status ${response.status}`)
  return body
}

const encode = (value: string) => encodeURIComponent(value)

// --- Multisig transaction requests ---------------------------------------

export const listMultiSigRequests = (multiSigAddress: string) =>
  fetchJson(`/api/multisig-requests?multiSigAddress=${encode(multiSigAddress)}`, { method: 'GET' })

export const getMultiSigRequestById = (id: string) =>
  fetchJson(`/api/multisig-requests/${encode(id)}`, { method: 'GET' })

export const addMultiSigRequest = (body: MultiSigTransactionRequest) =>
  fetchWrite('/api/multisig-requests', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(body)
  })

export const patchMultiSigRequest = (id: string, body: Record<string, unknown>) =>
  fetchWrite(`/api/multisig-requests/${encode(id)}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(body)
  })

export const deleteMultiSigRequest = (id: string) =>
  fetchJson(`/api/multisig-requests/${encode(id)}`, {
    method: 'DELETE',
    headers: JSON_HEADERS,
    body: JSON.stringify({})
  })

export const resetMultiSigRequest = (id: string) =>
  fetchJson(`/api/multisig-requests/${encode(id)}/reset`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({})
  })

export const cancelMultiSigRequest = (id: string) =>
  fetchJson(`/api/multisig-requests/${encode(id)}/cancel`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({})
  })

// Analytics report for a confirmed deposit. Fire-and-forget: a failure must
// not surface a toast, so this skips fetchJson's 401 handler on purpose.
export const reportMultiSigFunded = (body: {
  multiSigAddress: string
  chainId: number
  txHash: string
  asset: 'native' | 'erc20'
  tokenAddress?: string
  amount?: string
}) =>
  fetch('/api/events/multisig-funded', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(body)
  }).catch(() => undefined)

// --- Multisig wallets ----------------------------------------------------
//
// POST is an idempotent upsert on (chainId, address); PATCH is a partial
// update (owner list, threshold, owner-only-request guard, …). Keeping the
// two verbs distinct is what tells the server which fields it may treat as
// fresh (POST) versus partial (PATCH).

export const createMultiSigWallet = (wallet: MultiSig) =>
  fetchJson('/api/multisig-wallets', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(wallet)
  })

export const patchMultiSigWallet = (wallet: Partial<MultiSig> & { chainId: number; address: string }) =>
  fetchJson('/api/multisig-wallets', {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(wallet)
  })

export const listMultiSigWallets = (ownerAddress: string) =>
  fetchJson(`/api/multisig-wallets?ownerAddress=${encode(ownerAddress)}`, { method: 'GET' })

// --- Address book --------------------------------------------------------

export const upsertAddressBookEntry = (entry: Record<string, unknown>) =>
  fetchJson('/api/address-book', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(entry)
  })

export const removeAddressBookEntry = (entry: { ownerAddress: string; chainId: number; address: string }) =>
  fetchJson('/api/address-book', {
    method: 'DELETE',
    headers: JSON_HEADERS,
    body: JSON.stringify(entry)
  })

export const listAddressBook = (ownerAddress: string) =>
  fetchJson(`/api/address-book?ownerAddress=${encode(ownerAddress)}`, { method: 'GET' })

// --- Saved contracts (call builder) -------------------------------------

export const upsertSavedContract = (contract: Record<string, unknown>) =>
  fetchJson('/api/saved-contracts', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(contract)
  })

export const listSavedContracts = (ownerAddress: string) =>
  fetchJson(`/api/saved-contracts?ownerAddress=${encode(ownerAddress)}`, { method: 'GET' })

// --- User-deployed factories ---------------------------------------------

export const addFactory = (factory: Record<string, unknown>) =>
  fetchJson('/api/factories', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(factory)
  })

export const listFactories = (ownerAddress: string) =>
  fetchJson(`/api/factories?ownerAddress=${encode(ownerAddress)}`, { method: 'GET' })

// --- Agent API keys (SIWE session only) ----------------------------------

export type AgentApiKeyScope = 'read' | 'propose' | 'sign' | 'manage'

export type AgentApiKey = {
  id: string
  name: string
  keyPrefix: string
  scopes: AgentApiKeyScope[]
  walletAddresses: string[]
  createdAt: string | null
  lastUsedAt: string | null
  expiresAt: string | null
  revokedAt: string | null
}

export const listAgentApiKeys = async (): Promise<AgentApiKey[]> => {
  const body = (await fetchJson('/api/agent-keys', { method: 'GET' })) as { content?: AgentApiKey[] }
  return body.content ?? []
}

// Resolves with the full key — shown to the user exactly once.
export const createAgentApiKey = async (input: {
  name: string
  scopes: AgentApiKeyScope[]
  walletAddresses?: string[]
  expiresInDays?: number | null
}): Promise<{ key: string; info: AgentApiKey }> => {
  const body = (await fetchWrite('/api/agent-keys', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input)
  })) as { content: { key: string; info: AgentApiKey } }
  return body.content
}

export const revokeAgentApiKey = (id: string) =>
  fetchWrite(`/api/agent-keys/${encode(id)}`, { method: 'DELETE', headers: JSON_HEADERS })

// --- Admin ----------------------------------------------------------------

export const listPublicAddressBook = () => fetchJson('/api/admin/public-address-book', { method: 'GET' })

// --- Legacy callers --------------------------------------------------------
// Pre-existing single-purpose endpoints that pre-date the dedicated-API
// refactor. They do their own key management server-side and need no SIWE
// session, so they survive unchanged.

const verifyContract = (data: object) => {
  return fetch('/api/verify', {
    body: JSON.stringify(data),
    method: 'POST'
  }).then((response) => {
    return response.json()
  })
}

const getABI = (data: object) => {
  return fetch('/api/getABI', {
    body: JSON.stringify(data),
    method: 'POST'
  }).then((response) => {
    return response.json()
  })
}

const getAssets = (data: { address: string; chainId: number }) => {
  return fetch('/api/get-assets', {
    body: JSON.stringify(data),
    method: 'POST'
  }).then((response) => {
    return response.json()
  })
}

// Resolves with the page of incoming transfers; rejects when the indexer call
// fails so the activity feed can surface the error.
const getIncomingTransfers = async (data: {
  address: string
  chainId: number
  fromBlock?: string
  toBlock?: string
  pageKey?: string
}): Promise<IncomingTransfersPage> => {
  const response = await fetch('/api/incoming-transfers', {
    body: JSON.stringify(data),
    method: 'POST'
  })
  const json = await response.json()
  if (!response.ok) throw new Error(String(json.message ?? 'Failed to load incoming transfers'))
  return json.content as IncomingTransfersPage
}

export { verifyContract, getABI, getAssets, getIncomingTransfers }
