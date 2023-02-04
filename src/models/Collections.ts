export type TCollectionList =
  // Actions
  | 'actions'
  // Log
  | 'logActions'
  | 'logAddDbs'
  | 'logDelDbs'
  | 'logUpdDbs'
  // Wallet
  | 'wallets'

export type TCollection = {
  name: TCollectionList
}

export type TClasses = TCollectionList[]

const collections = [
  // Actions
  { name: 'actions' },
  // Log
  { name: 'logActions' },
  { name: 'logAddDbs' },
  { name: 'logDelDbs' },
  { name: 'logUpdDbs' },
  // Wallet
  { name: 'wallets' },
]

export default collections
