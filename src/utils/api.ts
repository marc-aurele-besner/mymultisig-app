import { toast } from 'sonner'

import { MultiSig, MultiSigTransactionRequest } from '../models/MultiSigs'

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
const fetchJson = (url: string, init: RequestInit = {}) =>
  fetch(url, init).then(handleContentResponse)

const encode = (value: string) => encodeURIComponent(value)

// --- Multisig transaction requests ---------------------------------------

export const listMultiSigRequests = (multiSigAddress: string) =>
  fetchJson(`/api/multisig-requests?multiSigAddress=${encode(multiSigAddress)}`, { method: 'GET' })

export const getMultiSigRequestById = (id: string) =>
  fetchJson(`/api/multisig-requests/${encode(id)}`, { method: 'GET' })

export const addMultiSigRequest = (body: MultiSigTransactionRequest) =>
  fetchJson('/api/multisig-requests', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(body)
  })

export const patchMultiSigRequest = (id: string, body: Record<string, unknown>) =>
  fetchJson(`/api/multisig-requests/${encode(id)}`, {
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

// --- Admin ----------------------------------------------------------------

export const listPublicAddressBook = () =>
  fetchJson('/api/admin/public-address-book', { method: 'GET' })

// --- Legacy helpers (kept during migration, will be removed) ------------

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

const getContent = (data: object) => {
  return fetch('/api/get-content', {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(handleContentResponse)
}

const addContent = (data: object) => {
  return fetch('/api/add-content', {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(handleContentResponse)
}

const updateContent = (data: object, documentId: string) => {
  return fetch('/api/update-content/' + documentId, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(handleContentResponse)
}

const deleteContent = (data: object, documentId: string) => {
  return fetch('/api/delete-content/' + documentId, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(handleContentResponse)
}

export {
  verifyContract,
  getABI,
  addContent,
  deleteContent,
  getAssets,
  getContent,
  updateContent
}
