// Plain-language definitions for the crypto words the onboarding copy cannot
// avoid. Shown inline by <Term> and listed in full in the docs glossary.
export type GlossaryKey =
  | 'wallet'
  | 'key'
  | 'network'
  | 'nativeCoin'
  | 'gas'
  | 'signature'
  | 'onchain'
  | 'owner'
  | 'threshold'
  | 'execute'
  | 'testnet'

export interface GlossaryEntry {
  term: string
  definition: string
}

export const glossary: Record<GlossaryKey, GlossaryEntry> = {
  wallet: {
    term: 'Wallet',
    definition:
      'An app such as MetaMask or Coinbase Wallet that holds your key and lets you approve actions. Coins held on an exchange account are not in a wallet you control.'
  },
  key: {
    term: 'Key',
    definition:
      'The secret your wallet app keeps for you. Whoever has it can move that wallet’s funds. Your wallet app creates one when you set it up.'
  },
  network: {
    term: 'Network',
    definition:
      'The blockchain your wallet and funds live on, such as Ethereum, Polygon or Arbitrum. A multisig exists on the network it was created on.'
  },
  nativeCoin: {
    term: 'Native coin',
    definition:
      'The main currency of a network, used to pay its fees: ETH on Ethereum, Optimism and Arbitrum, POL on Polygon, BNB on BNB Chain, AVAX on Avalanche.'
  },
  gas: {
    term: 'Gas',
    definition:
      'The small fee a network charges to record a transaction, paid in its native coin by whoever sends it. Approving a request in MyMultiSig costs no gas.'
  },
  signature: {
    term: 'Signature',
    definition:
      'A free approval your wallet creates with your key. It proves you agreed to something without sending a transaction or paying a fee.'
  },
  onchain: {
    term: 'Onchain',
    definition:
      'Recorded on the blockchain itself, where anyone can check it and no company, including this app, can change it.'
  },
  owner: {
    term: 'Owner',
    definition: 'A wallet allowed to approve transactions for a multisig. A multisig usually has two or more.'
  },
  threshold: {
    term: 'Threshold',
    definition:
      'How many owners must approve before money can move, for example 2 of 3. The rule is part of the wallet, so nobody can skip it.'
  },
  execute: {
    term: 'Execute',
    definition:
      'Send the approved transaction to the network so it actually happens. Any owner can do it once enough owners approved, and they pay the gas.'
  },
  testnet: {
    term: 'Testnet',
    definition:
      'A practice network, such as Sepolia, whose coins are free and worth nothing. Try MyMultiSig there before using real money.'
  }
}

export const glossaryOrder: GlossaryKey[] = [
  'wallet',
  'key',
  'network',
  'nativeCoin',
  'gas',
  'signature',
  'onchain',
  'owner',
  'threshold',
  'execute',
  'testnet'
]
