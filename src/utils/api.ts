import { toast } from 'sonner'

// Content routes reject callers without a SIWE session (401). Surface that
// once instead of letting fire-and-forget writes fail silently.
let lastAuthToast = 0
const handleContentResponse = (response: Response) => {
  if (response.status === 401 && Date.now() - lastAuthToast > 30_000) {
    lastAuthToast = Date.now()
    toast.error('Wallet not verified — reconnect your wallet and sign the sign-in message to sync your data.')
  }
  return response.json()
}

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

const signData = (data: object) => {
  return fetch('/api/signData', {
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

export { verifyContract, getABI, signData, addContent, deleteContent, getContent, updateContent }
