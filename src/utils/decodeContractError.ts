import { BaseError, ContractFunctionRevertedError } from 'viem'

// Friendly copy for the MyMultiSig / MyMultiSigExtended / factory custom errors.
const ERROR_MESSAGES: Record<string, string> = {
  NotOwner: 'The connected wallet is not an owner of this multisig.',
  InvalidOwner: 'One of the signatures does not come from a current owner.',
  InvalidSignatures: 'The collected signatures do not satisfy the threshold.',
  OwnerAlreadySigned: 'An owner voted twice (signature and on-chain approval count once).',
  NotEnoughGas: 'The transaction did not include enough gas for the inner call.',
  OnlyThisContract: 'This operation must run as a multisig transaction (self-call).',
  OwnerAlreadyExists: 'This address is already an owner.',
  CannotRemoveOwnerBelowThreshold: 'Removing this owner would leave fewer owners than the threshold.',
  ThresholdMustBeGreaterThanZero: 'The threshold must be at least 1.',
  ThresholdMustBeLessOrEqualToOwnerCount: 'The threshold cannot exceed the number of owners.',
  OldOwnerMustBeOwner: 'The address to replace is not a current owner.',
  NewOwnerMustNotBeOwner: 'The replacement address is already an owner.',
  NewOwnerMustNotBeZero: 'The replacement address cannot be the zero address.',
  TooManyOwners: 'The wallet reached the maximum number of owners.',
  NonceAlreadyUsed: 'This nonce was already used or burned.',
  TransferInactiveOwnershipTooShort: 'The inactivity window must be at least 7 days.',
  TransferInactiveOwnershipBelowMinimum: 'The inactivity window is below the wallet minimum.',
  OwnerMustBeAnOwner: 'The delegating address is not a current owner.',
  OwnerIsNotAnOwner: 'The address to take over is not a current owner.',
  DelegateeCannotBeZero: 'The delegatee cannot be the zero address.',
  DelegateeAlreadyOwnerOrDelegatee: 'The delegatee is already an owner or a delegatee.',
  SenderNotDelegatee: 'Only the named delegatee can take over this seat.',
  OwnerStillActive: 'The owner is still active; the inactivity window has not elapsed.'
}

// Extracts a human-readable reason from a wagmi/viem contract error, decoding
// the wallet's custom errors when the ABI made them available.
const decodeContractError = (error: unknown): string | null => {
  if (!(error instanceof BaseError)) return null
  const revert = error.walk((e) => e instanceof ContractFunctionRevertedError)
  if (revert instanceof ContractFunctionRevertedError) {
    const errorName = revert.data?.errorName ?? revert.signature
    if (errorName != null && ERROR_MESSAGES[errorName] != null) return ERROR_MESSAGES[errorName]
    if (errorName != null) return `Reverted with ${errorName}`
    if (revert.reason != null) return revert.reason
  }
  return error.shortMessage ?? null
}

export default decodeContractError
