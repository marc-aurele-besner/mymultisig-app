import { TCollectionList } from './Collections'

export type TIndex = {
  name: string
  classes: TCollectionList
  private?: boolean
  terms?: string[]
}
export type TIndexes = TIndex[]

export const indexes: TIndexes = [
  // Actions
  {
    name: 'all_actions',
    classes: 'actions'
  },
  {
    name: 'actions_by_id',
    classes: 'actions',
    private: true,
    terms: ['data.id']
  },
  // MultiSig
  {
    name: 'all_multisig-factories',
    classes: 'multisig-factories'
  },
  {
    name: 'multisig-factories_by_chainId',
    classes: 'multisig-factories',
    private: true,
    terms: ['data.chainId']
  },
  {
    name: 'multisig-factories_by_address',
    classes: 'multisig-factories',
    private: true,
    terms: ['data.address']
  },
  {
    name: 'multisig-factories_by_chainIdAndAddress',
    classes: 'multisig-factories',
    private: true,
    terms: ['data.chainIdAndAddress']
  },
  {
    name: 'multisig-requests_by_id',
    classes: 'multisig-requests',
    private: true,
    terms: ['data.id']
  },
  {
    name: 'multisig-requests_by_multiSigAddress',
    classes: 'multisig-requests',
    private: true,
    terms: ['data.multiSigAddress']
  },
  {
    name: 'multisig-requests_by_multiSigAddress_and_isActive',
    classes: 'multisig-requests',
    private: true,
    terms: ['data.multiSigAddress', 'data.isActive']
  },
  {
    name: 'all_multisig-requests',
    classes: 'multisig-requests'
  },
  {
    name: 'multisig-requests_by_id',
    classes: 'multisig-requests',
    private: true,
    terms: ['data.id']
  },
  {
    name: 'multisig-requests_by_multisig-wallet',
    classes: 'multisig-requests',
    private: true,
    terms: ['data.multisig-wallet']
  },
  {
    name: 'multisig-requests_by_submitter',
    classes: 'multisig-requests',
    private: true,
    terms: ['data.submitter']
  },
  {
    name: 'all_multisig-wallets',
    classes: 'multisig-wallets'
  },
  {
    name: 'multisig-wallets_by_address',
    classes: 'multisig-wallets',
    private: true,
    terms: ['data.address']
  },
  {
    name: 'multisig-wallets_by_chainIdAndAddress',
    classes: 'multisig-wallets',
    private: true,
    terms: ['data.chainIdAndAddress']
  },
  // Log
  {
    name: 'logActions_by_id',
    classes: 'logActions',
    private: true,
    terms: ['data.id']
  },
  {
    name: 'logActions_by_function',
    classes: 'logActions',
    private: true,
    terms: ['data.function']
  },
  {
    name: 'logAddDbs_by_id',
    classes: 'logAddDbs',
    private: true,
    terms: ['data.id']
  },
  {
    name: 'logAddDbs_by_class',
    classes: 'logAddDbs',
    private: true,
    terms: ['data.class']
  },
  {
    name: 'logAddDbs_by_document',
    classes: 'logAddDbs',
    private: true,
    terms: ['data.document']
  },
  {
    name: 'logDelDbs_by_id',
    classes: 'logDelDbs',
    private: true,
    terms: ['data.id']
  },
  {
    name: 'logDelDbs_by_class',
    classes: 'logDelDbs',
    private: true,
    terms: ['data.class']
  },
  {
    name: 'logDelDbs_by_index',
    classes: 'logDelDbs',
    private: true,
    terms: ['data.index']
  },
  {
    name: 'logDelDbs_by_document',
    classes: 'logDelDbs',
    private: true,
    terms: ['data.document']
  },
  {
    name: 'logUpdDbs_by_id',
    classes: 'logUpdDbs',
    private: true,
    terms: ['data.id']
  },
  {
    name: 'logUpdDbs_by_class',
    classes: 'logUpdDbs',
    private: true,
    terms: ['data.class']
  },
  {
    name: 'logUpdDbs_by_document',
    classes: 'logUpdDbs',
    private: true,
    terms: ['data.document']
  },
  // Wallet
  {
    name: 'all_wallets',
    classes: 'wallets'
  },
  {
    name: 'wallets_by_id',
    classes: 'wallets',
    private: true,
    terms: ['data.id']
  }
]

export default indexes
