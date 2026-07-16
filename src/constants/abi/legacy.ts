// Event fragments that only exist on contracts deployed from factory versions
// before 0.1.x (e.g. the original Goerli factory 0.0.12). Their signatures
// differ from the current ABI, so watchers must register both shapes to cover
// old and new deployments.

// Renamed to TxFailure (with an extra `reason` arg) in MyMultiSig 0.1.x.
export const LegacyTransactionFailedEvent = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'value', type: 'uint256' },
      { indexed: false, internalType: 'bytes', name: 'data', type: 'bytes' },
      { indexed: false, internalType: 'uint256', name: 'txnGas', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'txnNonce', type: 'uint256' }
    ],
    name: 'TransactionFailed',
    type: 'event'
  }
] as const

// Removed from the package ABI in 0.5.0 (superseded by the validUntil /
// operation flavored overloads), but still the only shapes deployed pre-0.5.0
// wallets answer to. useRequestApprovalState appends these for legacy wallets.
export const LegacyHashFragments = [
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
      { internalType: 'uint256', name: 'txnGas', type: 'uint256' },
      { internalType: 'uint256', name: 'txnNonce', type: 'uint256' }
    ],
    name: 'generateHash',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
      { internalType: 'uint256', name: 'txnGas', type: 'uint256' },
      { internalType: 'uint256', name: 'txnNonce', type: 'uint256' },
      { internalType: 'bytes', name: 'signatures', type: 'bytes' }
    ],
    name: 'isValidSignature',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

// Custom errors dropped from the 0.5.0 ABI but still reverted by pre-0.5.0
// wallets; appended to write configs so decodeContractError keeps naming them.
export const LegacyWalletErrors = [
  { inputs: [], name: 'InvalidOwner', type: 'error' },
  { inputs: [], name: 'OwnerAlreadySigned', type: 'error' }
] as const

// The community factory deployment ships the pre-0.5.0 bytecode snapshot in
// factoryDeployArtifacts.json (the 0.5.0 package publishes no bytecode), whose
// constructor takes two deployers — the 0.5.0 ABI's takes three, so deployment
// must encode against this legacy shape.
export const LegacyFactoryDeployAbi = [
  {
    inputs: [
      { internalType: 'address', name: 'myMultiSigDeployer_', type: 'address' },
      { internalType: 'address', name: 'myMultiSigExtendedDeployer_', type: 'address' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  { inputs: [], name: 'initialize', outputs: [], stateMutability: 'nonpayable', type: 'function' }
] as const

// Version reported by the factory bytecode in factoryDeployArtifacts.json
// (built from the pre-0.5.0 source commit recorded in that file).
export const LEGACY_FACTORY_DEPLOY_VERSION = '0.1.1'

// Factory 0.1.x appends `threshold` to MyMultiSigCreated, changing the topic hash.
export const LegacyMyMultiSigCreatedEvent = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: true, internalType: 'address', name: 'contractAddress', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'contractIndex', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'contractName', type: 'string' },
      { indexed: false, internalType: 'address[]', name: 'originalOwners', type: 'address[]' }
    ],
    name: 'MyMultiSigCreated',
    type: 'event'
  }
] as const
