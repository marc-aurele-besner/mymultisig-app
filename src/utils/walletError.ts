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

const CONNECT_FALLBACK = 'Something went wrong while connecting. Please try again.'

// wagmi throws ProviderNotFoundError when the picked connector has no wallet
// behind it (no extension installed, no wallet app on the phone).
export const isProviderNotFound = (error: unknown): boolean => {
  if (error == null) return false
  const { name, message } = error as { name?: unknown; message?: unknown }
  if (name === 'ProviderNotFoundError') return true
  return typeof message === 'string' && /provider not found/i.test(message)
}

// Plain-language sentence for an error from connecting a wallet. Library
// names, versions and docs links never reach the screen.
export const describeConnectError = (error: unknown): string => {
  if (error == null) return CONNECT_FALLBACK
  if (isUserRejection(error)) return 'You closed the wallet prompt. Pick a wallet to try again.'
  if (isProviderNotFound(error)) return 'No wallet app was found in this browser.'
  const { name, code, message } = error as { name?: unknown; code?: unknown; message?: unknown }
  if (name === 'ConnectorAlreadyConnectedError') return 'This wallet is already connected.'
  if (name === 'ConnectorNotFoundError') return 'That wallet is not available here. Try another one.'
  if (name === 'ChainNotConfiguredError' || name === 'SwitchChainNotSupportedError')
    return 'Your wallet is on a network MyMultiSig does not support. Switch network in your wallet and try again.'
  if (code === -32002 || (typeof message === 'string' && /already pending|request.*pending/i.test(message)))
    return 'Your wallet already has a request waiting. Open your wallet to approve or close it.'
  const short = (error as { shortMessage?: unknown }).shortMessage
  const raw = typeof short === 'string' && short !== '' ? short : describeWalletError(error)
  const cleaned = raw
    .replace(/\s*Version:[\s\S]*$/i, '')
    .replace(/\s*Docs:[\s\S]*$/i, '')
    .replace(/@?wagmi\/core@\S+/gi, '')
    .trim()
  return cleaned !== '' && cleaned !== 'Unknown error.' ? cleaned : CONNECT_FALLBACK
}
