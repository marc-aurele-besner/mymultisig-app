export type Action = {
  id: string
  name: string
  description: string
  level: number
  available: boolean
  createdAt: Date
  updatedAt?: Date
}
