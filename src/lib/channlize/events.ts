import { sendChannlizeEvent } from './client'

// Typed catalog of the events the app emits. Each builder fixes the event key and
// the idempotency key in one place. The data object fills the {{field}} placeholders
// of the Slack template configured for that key in the Channlize dashboard.
//
// Every builder is awaited by its caller. sendChannlizeEvent never throws, so
// awaiting cannot fail the request, and awaiting keeps the send from being cut
// off when a serverless function returns.

const DAY = () => new Date().toISOString().slice(0, 10)
const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`
const clip = (text: string, max = 300) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)

// Wallet signed in (SIWE). Keyed per day so repeated sign-ins do not flood.
export const trackWalletConnected = (params: { address: string }) =>
  sendChannlizeEvent(
    'wallet.connected',
    { address: params.address, shortAddress: shortAddress(params.address) },
    `wallet.connected:${params.address.toLowerCase()}:${DAY()}`
  )

// Multisig wallet first saved to the database (created or imported).
export const trackMultisigCreated = (params: {
  address: string
  chainId: number
  chainName: string
  name: string
  threshold: number
  ownerCount: number
}) =>
  sendChannlizeEvent(
    'multisig.created',
    {
      address: params.address,
      name: params.name,
      chainId: params.chainId,
      chainName: params.chainName,
      threshold: params.threshold,
      ownerCount: params.ownerCount,
      summary: `${params.name} (${shortAddress(params.address)}) on ${params.chainName}: ${params.threshold}/${params.ownerCount} signers`
    },
    `multisig.created:${params.chainId}:${params.address.toLowerCase()}`
  )

// Native or ERC-20 deposit into a multisig, reported by the browser after the
// transaction is confirmed.
export const trackMultisigFunded = (params: {
  multiSigAddress: string
  chainId: number
  txHash: string
  asset: 'native' | 'erc20'
  tokenAddress?: string
  amount?: string
  funder: string
}) =>
  sendChannlizeEvent(
    'multisig.funded',
    {
      multiSigAddress: params.multiSigAddress,
      chainId: params.chainId,
      txHash: params.txHash,
      asset: params.asset,
      funder: params.funder,
      tokenAddress: params.tokenAddress ?? null,
      amount: params.amount ?? null,
      summary: `${shortAddress(params.funder)} funded ${shortAddress(params.multiSigAddress)} (${params.asset}, tx ${shortAddress(params.txHash)})`
    },
    `multisig.funded:${params.chainId}:${params.txHash.toLowerCase()}`
  )

// New transaction request queued on a multisig.
export const trackTransactionCreated = (params: {
  requestId: string
  multiSigAddress: string
  chainId: number | null
  submitter: string
  description: string
}) =>
  sendChannlizeEvent(
    'transaction.created',
    {
      requestId: params.requestId,
      multiSigAddress: params.multiSigAddress,
      chainId: params.chainId,
      submitter: params.submitter,
      description: clip(params.description),
      summary: clip(
        `${shortAddress(params.submitter)} queued "${params.description}" on ${shortAddress(params.multiSigAddress)}`
      )
    },
    `transaction.created:${params.requestId}`
  )

// A signer added a signature. Keyed by the resulting count, so each new
// signature is its own event and a retry is dropped.
export const trackTransactionSigned = (params: {
  requestId: string
  multiSigAddress: string
  signatureCount: number
}) =>
  sendChannlizeEvent(
    'transaction.signed',
    {
      requestId: params.requestId,
      multiSigAddress: params.multiSigAddress,
      signatureCount: params.signatureCount,
      summary: `Transaction on ${shortAddress(params.multiSigAddress)} now has ${params.signatureCount} signature(s)`
    },
    `transaction.signed:${params.requestId}:${params.signatureCount}`
  )

// Transaction executed on chain. Success and failure are separate event keys, so
// each can get its own Slack template and severity in the dashboard.
export const trackTransactionExecuted = (params: {
  requestId: string
  multiSigAddress: string
  isSuccessful: boolean
}) =>
  sendChannlizeEvent(
    params.isSuccessful ? 'transaction.executed' : 'transaction.execution_failed',
    {
      requestId: params.requestId,
      multiSigAddress: params.multiSigAddress,
      isSuccessful: params.isSuccessful,
      summary: `Transaction on ${shortAddress(params.multiSigAddress)} ${params.isSuccessful ? 'executed successfully' : 'failed to execute'}`
    },
    `transaction.executed:${params.requestId}`
  )

export const trackTransactionCancelled = (params: {
  requestId: string
  multiSigAddress: string
  cancelledBy: string
}) =>
  sendChannlizeEvent(
    'transaction.cancelled',
    {
      requestId: params.requestId,
      multiSigAddress: params.multiSigAddress,
      cancelledBy: params.cancelledBy,
      summary: `Transaction on ${shortAddress(params.multiSigAddress)} cancelled by ${params.cancelledBy}`
    },
    `transaction.cancelled:${params.requestId}`
  )

// Signatures wiped so a transaction can be re-signed.
export const trackTransactionReset = (params: {
  requestId: string
  multiSigAddress: string
  previousSignatureCount: number
}) =>
  sendChannlizeEvent(
    'transaction.reset',
    {
      requestId: params.requestId,
      multiSigAddress: params.multiSigAddress,
      previousSignatureCount: params.previousSignatureCount,
      summary: `Transaction on ${shortAddress(params.multiSigAddress)} reset (${params.previousSignatureCount} signature(s) cleared)`
    },
    `transaction.reset:${params.requestId}:${params.previousSignatureCount}`
  )
