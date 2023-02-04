export type WalletType = 'EVM'

export type Wallet = {
  id: string
  name: string
  description: string
  available: boolean
  type: WalletType
  createdAt: Date
  updatedAt?: Date
}
