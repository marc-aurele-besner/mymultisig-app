// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addContent = (data: any) => {
  return fetch('/api/add-content', {
    body: JSON.stringify(data),
    method: 'POST',
  }).then((response) => {
    return response.json()
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deleteContent = (data: any) => {
  return fetch('/api/delete-content', {
    body: JSON.stringify(data),
    method: 'POST',
  }).then((response) => {
    return response.json()
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getContent = (data: any) => {
  return fetch('/api/get-content', {
    body: JSON.stringify(data),
    method: 'POST',
  }).then((response) => {
    return response.json()
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateContent = (data: any) => {
  return fetch('/api/update-content', {
    body: JSON.stringify(data),
    method: 'POST',
  }).then((response) => {
    return response.json()
  })
}

export { addContent, deleteContent, getContent, updateContent }
