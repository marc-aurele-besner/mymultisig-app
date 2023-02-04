export type LogAction = {
  id: string
  function: string
  createdAt: Date
  updatedAt?: Date
}

export type LogAddDb = {
  id: string
  class: string
  action: string
  function: string
  document: string
  createdAt: Date
  updatedAt?: Date
}

export type LogDelDb = {
  id: string
  class: string
  index: string
  term: string
  document: string
  createdAt: Date
  updatedAt?: Date
}

export type LogUpdDb = {
  id: string
  class: string
  index: string
  term: string
  document: string
  createdAt: Date
  updatedAt?: Date
}
