import { ChannlizeEvent, ChannlizeFieldValue, sendChannlizeEvent } from './client'

// Typed catalog of the events the app emits. Each builder fixes the event key,
// type and idempotency key in one place so call sites only pass facts.
//
// Every builder is awaited by its caller. sendChannlizeEvent never throws, so
// awaiting cannot fail the request, and awaiting keeps the send from being cut
// off when a serverless function returns.

const DAY = () => new Date().toISOString().slice(0, 10)
const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`
const clip = (text: string, max = 300) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)

// Wallet signed in (SIWE). Keyed per day so repeated sign-ins do not flood.
export const trackWalletConnected = (params: { address: string }) =>
  sendChannlizeEvent({
    type: 'log',
    event: 'wallet.connected',
    message: `Wallet ${shortAddress(params.address)} connected`,
    fields: { address: params.address },
    idempotencyKey: `wallet.connected:${params.address.toLowerCase()}:${DAY()}`
  })

// Multisig wallet first saved to the database (created or imported).
export const trackMultisigCreated = (params: {
  address: string
  chainId: number
  chainName: string
  name: string
  threshold: number
  ownerCount: number
}) =>
  sendChannlizeEvent({
    type: 'log',
    event: 'multisig.created',
    title: `Multisig ${params.name} added`,
    message: `${params.name} (${shortAddress(params.address)}) on ${params.chainName}: ${params.threshold}/${params.ownerCount} signers`,
    fields: {
      address: params.address,
      chainId: params.chainId,
      chainName: params.chainName,
      threshold: params.threshold,
      ownerCount: params.ownerCount
    },
    idempotencyKey: `multisig.created:${params.chainId}:${params.address.toLowerCase()}`
  })

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
}) => {
  const fields: Record<string, ChannlizeFieldValue> = {
    multiSigAddress: params.multiSigAddress,
    chainId: params.chainId,
    txHash: params.txHash,
    asset: params.asset,
    funder: params.funder
  }
  if (params.tokenAddress) fields.tokenAddress = params.tokenAddress
  if (params.amount) fields.amount = params.amount
  return sendChannlizeEvent({
    type: 'log',
    event: 'multisig.funded',
    message: `${shortAddress(params.funder)} funded ${shortAddress(params.multiSigAddress)} (${params.asset}, tx ${shortAddress(params.txHash)})`,
    fields,
    idempotencyKey: `multisig.funded:${params.chainId}:${params.txHash.toLowerCase()}`
  })
}

// New transaction request queued on a multisig.
export const trackTransactionCreated = (params: {
  requestId: string
  multiSigAddress: string
  chainId: number | null
  submitter: string
  description: string
}) =>
  sendChannlizeEvent({
    type: 'log',
    event: 'transaction.created',
    title: 'New transaction request',
    message: clip(
      `${shortAddress(params.submitter)} queued "${params.description}" on ${shortAddress(params.multiSigAddress)}`
    ),
    fields: {
      requestId: params.requestId,
      multiSigAddress: params.multiSigAddress,
      submitter: params.submitter,
      chainId: params.chainId
    },
    idempotencyKey: `transaction.created:${params.requestId}`
  })

// A signer added a signature. Keyed by the resulting count, so each new
// signature is its own event and a retry is dropped.
export const trackTransactionSigned = (params: {
  requestId: string
  multiSigAddress: string
  signatureCount: number
}) =>
  sendChannlizeEvent({
    type: 'log',
    event: 'transaction.signed',
    message: `Transaction on ${shortAddress(params.multiSigAddress)} now has ${params.signatureCount} signature(s)`,
    fields: {
      requestId: params.requestId,
      multiSigAddress: params.multiSigAddress,
      signatureCount: params.signatureCount
    },
    idempotencyKey: `transaction.signed:${params.requestId}:${params.signatureCount}`
  })

// Transaction executed on chain. A failed execution goes out as an alert.
export const trackTransactionExecuted = (params: {
  requestId: string
  multiSigAddress: string
  isSuccessful: boolean
}) =>
  sendChannlizeEvent({
    type: params.isSuccessful ? 'log' : 'alert',
    event: 'transaction.executed',
    title: params.isSuccessful ? 'Transaction executed' : 'Transaction execution failed',
    message: `Transaction on ${shortAddress(params.multiSigAddress)} ${params.isSuccessful ? 'executed successfully' : 'failed to execute'}`,
    fields: {
      requestId: params.requestId,
      multiSigAddress: params.multiSigAddress,
      isSuccessful: params.isSuccessful
    },
    idempotencyKey: `transaction.executed:${params.requestId}`
  })

export const trackTransactionCancelled = (params: {
  requestId: string
  multiSigAddress: string
  cancelledBy: string
}) =>
  sendChannlizeEvent({
    type: 'log',
    event: 'transaction.cancelled',
    message: `Transaction on ${shortAddress(params.multiSigAddress)} cancelled by ${params.cancelledBy}`,
    fields: {
      requestId: params.requestId,
      multiSigAddress: params.multiSigAddress,
      cancelledBy: params.cancelledBy
    },
    idempotencyKey: `transaction.cancelled:${params.requestId}`
  })

// Signatures wiped so a transaction can be re-signed.
export const trackTransactionReset = (params: {
  requestId: string
  multiSigAddress: string
  previousSignatureCount: number
}) =>
  sendChannlizeEvent({
    type: 'log',
    event: 'transaction.reset',
    message: `Transaction on ${shortAddress(params.multiSigAddress)} reset (${params.previousSignatureCount} signature(s) cleared)`,
    fields: {
      requestId: params.requestId,
      multiSigAddress: params.multiSigAddress,
      previousSignatureCount: params.previousSignatureCount
    },
    idempotencyKey: `transaction.reset:${params.requestId}:${params.previousSignatureCount}`
  })
