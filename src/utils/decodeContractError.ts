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
  OwnerStillActive: 'The owner is still active; the inactivity window has not elapsed.',
  // 0.5.0 additions
  SignatureExpired: 'The signatures on this request have expired (validUntil has passed). Collect fresh signatures.',
  RequiresOperationByte:
    'This 0.5.0 wallet requires the operation-byte transaction format. Reset and re-sign this request.',
  InvalidOperation: 'Unsupported operation byte: only CALL (0) and self-targeted DELEGATECALL (1) are allowed.',
  NotApproved: 'You never approved this hash on-chain, so there is nothing to revoke.',
  SensitiveCallRequiresDelay:
    'This operation is protected by the timelock: schedule it, wait out the delay, then execute it.',
  TimelockNotReady: 'The timelock delay has not elapsed yet for this scheduled transaction.',
  AlreadyScheduled: 'This transaction is already scheduled.',
  NotScheduled: 'This transaction was never scheduled (or was already cancelled).',
  ScheduleExpired: 'The scheduled transaction expired (validUntil passed) before it was executed.',
  NotSensitive: 'This call is not sensitive; execute it directly instead of scheduling it.',
  ZeroDelayForSensitive: 'The timelock is disabled; set a delay before scheduling.',
  DelayTooLong: 'The requested timelock delay exceeds the maximum the wallet accepts.',
  GuardReverted: 'The transaction guard rejected this transaction.',
  GuardIsZeroAddress: 'The guard cannot be the zero address.',
  TargetNotAllowed: 'The target address is not on the wallet’s allowlist.',
  TargetIsZeroAddress: 'The target cannot be the zero address.',
  DailySpendingLimitExceeded: 'This transfer exceeds what remains of the owner’s daily spending allowance.',
  AllowanceLimitNotSet: 'The connected owner has no daily spending allowance on this wallet.',
  AllowanceRequiresSingleSigner: 'Allowance transfers take exactly one signature, from the sending owner.',
  ModuleAlreadyEnabled: 'This module is already enabled.',
  ModuleNotFound: 'This module is not enabled on the wallet.',
  ModulePrevMismatch:
    'The previous-module pointer does not match: pass the module right before this one (zero address for the first).',
  ModuleIsZeroAddress: 'The module cannot be the zero address.',
  NotAModule: 'Only an enabled module can use the module execution path.',
  InvalidModuleOperation: 'Modules may only CALL, or DELEGATECALL into the wallet itself.',
  NotEntryPoint: 'Only the ERC-4337 EntryPoint can call this function.',
  InvalidNonce: 'The transaction nonce does not match the wallet’s current nonce.',
  BatchCallFailed: 'A step of the atomic batch failed, so the whole batch reverted.',
  MessageNotSigned: 'This message was never signed by the wallet.',
  // EntryPoint v0.7 custom errors (the bundler surfaces these when the
  // UserOp fails inside handleOps).
  FailedOp:
    'The bundler refused the UserOperation. Read the bundled transaction’s revert reason for the exact failure.',
  FailedOpWithRevert: 'The bundler refused the UserOperation and included the inner revert reason.',
  SignatureValidationFailed: 'The collected owner signatures do not satisfy the wallet’s threshold.',
  InvalidSender: 'The UserOp’s sender is not a deployed smart account on this EntryPoint.',
  InvalidPaymaster: 'The UserOp’s paymasterAndData is not a valid paymaster for this EntryPoint.',
  PaymasterDepositTooLow: 'The paymaster has insufficient deposit to cover this UserOp’s gas.',
  PaymasterAndDataEmpty: 'The paymaster stub rejected the op — paymasterAndData is empty.',
  SenderAddressMismatch: 'The address recovered from initCode does not match the UserOp sender.',
  InvalidAccount: 'The wallet does not recognise the UserOp sender.',
  ReentrancyGuard: 'A re-entrant call to the EntryPoint was blocked.',
  EntryPointInsufficientBalance: 'The wallet has no EntryPoint deposit to pay for this UserOp.',
  BundlerRejected: 'The bundler rejected the UserOperation before submission.'
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
