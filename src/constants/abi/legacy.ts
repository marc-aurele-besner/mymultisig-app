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
