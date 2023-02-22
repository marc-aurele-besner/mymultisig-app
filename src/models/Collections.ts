export type TCollectionList =
  // Actions
  | 'actions'
  // MultiSig
  | 'multisig-factories'
  | 'multisig-requests'
  | 'multisig-wallets'
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
  // MultiSig
  { name: 'multisig-factories' },
  { name: 'multisig-requests' },
  { name: 'multisig-wallets' },
  // Log
  { name: 'logActions' },
  { name: 'logAddDbs' },
  { name: 'logDelDbs' },
  { name: 'logUpdDbs' },
  // Wallet
  { name: 'wallets' }
]

export default collections
