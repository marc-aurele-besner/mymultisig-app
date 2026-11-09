import { BaseError, UserRejectedRequestError } from 'viem'

import decodeContractError from './decodeContractError'

// EIP-1193 code 4001 is "user rejected the request"; ACTION_REJECTED is the
// ethers-style code some injected wallets still return.
const REJECTION_PATTERN = /user (rejected|denied|cancel+ed)|rejected the request|request rejected|action_rejected/i

// True when the error only means the owner dismissed the wallet prompt.
// That is a normal choice, not a failure, so the UI should stay calm about it.
export const isUserRejection = (error: unknown): boolean => {
  if (error == null) return false
  if (error instanceof BaseError) {
    const rejected = error.walk((e) => e instanceof UserRejectedRequestError || (e as { code?: unknown }).code === 4001)
    if (rejected != null) return true
  }
  const { code, message } = error as { code?: unknown; message?: unknown }
  if (code === 4001 || code === 'ACTION_REJECTED') return true
  return typeof message === 'string' && REJECTION_PATTERN.test(message)
}

// One short, readable sentence for a wallet / contract error: the decoded
// custom error when there is one, otherwise viem's shortMessage, otherwise
// the first line of the raw message (never a JSON dump).
export const describeWalletError = (error: unknown): string => {
  if (error == null) return 'Unknown error.'
  const decoded = decodeContractError(error)
  if (decoded != null && decoded !== '') return decoded
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : null
  const firstLine = message
    ?.split('\n')
    .find((line) => line.trim() !== '')
    ?.trim()
  return firstLine != null && firstLine !== '' ? firstLine : 'Unknown error.'
}
