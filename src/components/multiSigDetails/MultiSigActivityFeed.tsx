import React from 'react'
import { useChainId, useChains } from 'wagmi'
import { formatEther } from 'viem'
import { Button } from '@/components/ui/button'
import { ExternalLinkIcon } from '../icons/ChakraIcons'
import { cn } from '@/lib/utils'

import useMultiSigActivity, { ActivityEntry } from '../../hooks/useMultiSigActivity'
import { useAddressLabels } from '../../states/addressBook'
import { ADMIN_ACTIONS, decodeSelfCall } from '../../utils/adminActions'

interface MultiSigActivityFeedProps {
  multiSigAddress: `0x${string}`
}

type Tone = 'neutral' | 'success' | 'destructive' | 'warning'

type Described = {
  title: string
  detail: string
  tone: Tone
}

const truncate = (value: string, head = 8, tail = 6) =>
  value.length > head + tail + 2 ? `${value.slice(0, head)}...${value.slice(-tail)}` : value

// Rebuilds the human description of a self-call admin payload by mapping the
// decoded args back onto the action's field order.
const describeAdminCall = (data: `0x${string}`): string | null => {
  const decoded = decodeSelfCall(data)
  if (decoded == null) return null
  const action = ADMIN_ACTIONS.find((a) => a.id === decoded.functionName)
  if (action == null) return decoded.functionName
  const values: Record<string, string> = {}
  action.fields.forEach((field, index) => {
    values[field.key] = String(decoded.args?.[index] ?? '')
  })
  return action.describe(values)
}

const describeEntry = (
  entry: ActivityEntry,
  multiSigAddress: `0x${string}`,
  labelFor?: (address: string) => string | undefined
): Described => {
  const args = entry.args
  // Prefer the address-book label; fall back to a truncated address.
  const named = (address: string) => {
    const label = labelFor?.(address)
    return label != null ? `${label} (${truncate(address)})` : truncate(address)
  }
  switch (entry.eventName) {
    case 'TransactionExecuted': {
      const to = String(args.to ?? '')
      const isSelfCall = to.toLowerCase() === multiSigAddress.toLowerCase()
      const adminDescription = isSelfCall ? describeAdminCall(String(args.data ?? '0x') as `0x${string}`) : null
      if (adminDescription != null) {
        return {
          title: 'Admin action executed',
          detail: `${adminDescription} (nonce ${args.txnNonce})`,
          tone: 'success'
        }
      }
      const value = BigInt(String(args.value ?? '0'))
      return {
        title: 'Transaction executed',
        detail: `To ${named(to)}${value > 0n ? `, ${formatEther(value)} ETH` : ''} (nonce ${args.txnNonce})`,
        tone: 'success'
      }
    }
    case 'TxFailure':
      return {
        title: 'Transaction failed',
        detail: `To ${named(String(args.to ?? ''))} (nonce ${args.txnNonce})`,
        tone: 'destructive'
      }
    case 'MultiRequestExecuted': {
      const successes = Array.isArray(args.successes) ? (args.successes as boolean[]) : []
      const succeeded = successes.filter(Boolean).length
      return {
        title: 'Batch executed',
        detail: `${succeeded} of ${successes.length} calls succeeded (nonce ${args.txNonce})`,
        tone: succeeded === successes.length ? 'success' : 'warning'
      }
    }
    case 'ApproveHash':
      return {
        title: 'Request approved on-chain',
        detail: `${named(String(args.owner ?? ''))} approved hash ${truncate(String(args.hash ?? ''))}`,
        tone: 'neutral'
      }
    case 'OwnerAdded':
      return { title: 'Owner added', detail: named(String(args.owner ?? '')), tone: 'success' }
    case 'OwnerRemoved':
      return { title: 'Owner removed', detail: named(String(args.owner ?? '')), tone: 'warning' }
    case 'ThresholdChanged':
      return { title: 'Threshold changed', detail: `New threshold: ${args.threshold}`, tone: 'neutral' }
    case 'ContractEndOfLife':
      return {
        title: 'Wallet approaching end of life',
        detail: `Only ${args.txNonceLefts} transaction nonces left`,
        tone: 'destructive'
      }
    default:
      return { title: entry.eventName, detail: '', tone: 'neutral' }
  }
}

const TONE_DOT: Record<Tone, string> = {
  neutral: 'bg-primary',
  success: 'bg-green-500',
  destructive: 'bg-destructive',
  warning: 'bg-yellow-500'
}

const formatWhen = (timestamp?: number) => {
  if (timestamp == null) return ''
  const seconds = Math.max(Math.floor(Date.now() / 1000) - timestamp, 0)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)} d ago`
  return new Date(timestamp * 1000).toLocaleDateString()
}

// Single activity line; also reused by the overview's recent-activity preview.
export const ActivityEntryRow: React.FC<{
  entry: ActivityEntry
  multiSigAddress: `0x${string}`
  explorerUrl?: string
  labelFor?: (address: string) => string | undefined
}> = ({ entry, multiSigAddress, explorerUrl, labelFor }) => {
  const { title, detail, tone } = describeEntry(entry, multiSigAddress, labelFor)
  return (
    <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3'>
      <div className='flex min-w-0 items-start gap-3'>
        <span className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', TONE_DOT[tone])} />
        <div className='flex min-w-0 flex-col'>
          <span className='text-sm font-semibold text-foreground'>{title}</span>
          {detail !== '' && <span className='break-all text-sm text-muted-foreground'>{detail}</span>}
        </div>
      </div>
      <div className='flex shrink-0 items-center gap-3 text-xs text-muted-foreground'>
        <span>{formatWhen(entry.timestamp) || `block ${entry.blockNumber}`}</span>
        {explorerUrl && (
          <a
            href={`${explorerUrl}/tx/${entry.transactionHash}`}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='View transaction on explorer'
            className='text-muted-foreground transition-colors hover:text-primary'
          >
            <ExternalLinkIcon className='h-3.5 w-3.5' />
          </a>
        )}
      </div>
    </div>
  )
}

// Live feed of everything the wallet has done on-chain: executions, failures,
// approvals, and owner/threshold/policy changes.
const MultiSigActivityFeed: React.FC<MultiSigActivityFeedProps> = ({ multiSigAddress }) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const explorerUrl = chain?.blockExplorers?.default?.url
  const { labelFor } = useAddressLabels(chain?.id)
  const { entries, isLoading, error, hasOlder, loadOlder } = useMultiSigActivity(multiSigAddress)

  return (
    <div className='flex w-full flex-col gap-4'>
      {error != null && (
        <div className='rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive'>
          Could not load activity: {error}
        </div>
      )}

      {entries.length === 0 && !isLoading && error == null && (
        <div className='rounded-xl border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground'>
          No on-chain activity found in the scanned blocks yet. Executed transactions, owner changes, and on-chain
          approvals will show up here.
        </div>
      )}

      <div className='flex w-full flex-col gap-2'>
        {entries.map((entry) => (
          <ActivityEntryRow
            key={entry.id}
            entry={entry}
            multiSigAddress={multiSigAddress}
            explorerUrl={explorerUrl}
            labelFor={labelFor}
          />
        ))}
      </div>

      {isLoading && (
        <div className='flex items-center justify-center gap-3 p-2'>
          <span className='h-3 w-3 animate-pulse rounded-full bg-primary' />
          <span className='text-sm text-muted-foreground'>Scanning blocks for activity...</span>
        </div>
      )}

      {!isLoading && hasOlder && (
        <Button variant='outline' onClick={() => loadOlder()}>
          Load older activity
        </Button>
      )}
      {!hasOlder && entries.length > 0 && (
        <p className='text-center text-xs text-muted-foreground'>Scanned back to the first block.</p>
      )}
    </div>
  )
}

export default MultiSigActivityFeed
