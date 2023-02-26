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
  }).then((response) => {
    return response.json()
  })
}

const addContent = (data: object) => {
  return fetch('/api/add-content', {
    body: JSON.stringify(data),
    method: 'POST'
  }).then((response) => {
    return response.json()
  })
}

const updateContent = (data: object, documentId: string) => {
  return fetch('/api/update-content' + documentId, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then((response) => {
    return response.json()
  })
}

const deleteContent = (data: object, documentId: string) => {
  return fetch('/api/delete-content/' + documentId, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then((response) => {
    return response.json()
  })
}

export { verifyContract, getABI, signData, addContent, deleteContent, getContent, updateContent }
