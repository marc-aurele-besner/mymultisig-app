import React from 'react'
import { cn } from '@/lib/utils'
import { CheckCircleIcon, ExternalLinkIcon, WarningIcon, WarningTwoIcon } from '../icons/ChakraIcons'
import { formatRequestDateTime } from '../../utils/requestDate'

export type ExecutionOutcomeKind = 'success' | 'partial' | 'failed'

interface ExecutionOutcomeProps {
  outcome: ExecutionOutcomeKind
  // ISO (or epoch-ms) timestamp of the execution; hidden when unparseable.
  dateExecuted: string
  // Human-readable amount, e.g. "0.001 ETH". Omitted when the call sends nothing.
  valueLabel?: string
  // Human-readable target, e.g. "Tester03 (0x5dFb…7Eed)".
  targetLabel: string
  multiSigAddress: `0x${string}`
  executionTxHash?: `0x${string}`
  explorerUrl?: string
  failedSteps?: number
  totalSteps?: number
}

const copy = (props: ExecutionOutcomeProps): { title: string; body: string } => {
  const { outcome, valueLabel, targetLabel, failedSteps, totalSteps } = props
  if (outcome === 'failed') {
    return {
      title: 'Executed, but the call failed',
      body: `The multisig transaction was mined, but the call to ${targetLabel} reverted inside the wallet. ${
        valueLabel != null ? `The ${valueLabel} was not sent and is still in the wallet.` : 'Nothing changed on-chain.'
      } The nonce was used, so these signatures cannot be reused: build a new request to try again.`
    }
  }
  if (outcome === 'partial') {
    return {
      title: 'Executed with failed steps',
      body: `${failedSteps ?? 'Some'} of ${totalSteps ?? 'the'} batch steps reverted; the others went through. See the step list above for which ones failed.`
    }
  }
  return {
    title: 'Executed successfully',
    body:
      valueLabel != null
        ? `${valueLabel} was sent to ${targetLabel}. The transaction is confirmed on-chain.`
        : `The call to ${targetLabel} succeeded. The transaction is confirmed on-chain.`
  }
}

// Final state of an executed request: what happened, when, and a link to the
// transaction so anyone can check it on the explorer.
const ExecutionOutcome: React.FC<ExecutionOutcomeProps> = (props) => {
  const { outcome, dateExecuted, multiSigAddress, executionTxHash, explorerUrl } = props
  const { title, body } = copy(props)
  const executedAt = formatRequestDateTime(dateExecuted)
  const Icon = outcome === 'success' ? CheckCircleIcon : outcome === 'partial' ? WarningIcon : WarningTwoIcon
  const tone =
    outcome === 'success'
      ? 'border-primary/40 bg-primary/10'
      : outcome === 'partial'
        ? 'border-amber-500/40 bg-amber-500/10'
        : 'border-destructive/40 bg-destructive/10'
  const iconTone =
    outcome === 'success' ? 'text-primary' : outcome === 'partial' ? 'text-amber-500' : 'text-destructive'

  const linkClass = 'inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline'

  return (
    <div role='status' className={cn('flex gap-3 rounded-lg border p-4', tone)}>
      <Icon boxSize={20} className={cn('mt-0.5 shrink-0', iconTone)} aria-hidden />
      <div className='min-w-0 flex-1'>
        <p className='font-semibold text-foreground'>{title}</p>
        <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>{body}</p>
        <dl className='mt-3 flex flex-col gap-1 text-sm'>
          {executedAt != null && (
            <div className='flex flex-wrap gap-x-2'>
              <dt className='text-muted-foreground'>Executed</dt>
              <dd className='text-foreground'>{executedAt}</dd>
            </div>
          )}
          {executionTxHash != null ? (
            <div className='flex flex-wrap gap-x-2'>
              <dt className='text-muted-foreground'>Transaction</dt>
              <dd className='min-w-0 break-all font-mono text-foreground'>
                {explorerUrl != null ? (
                  <a
                    href={`${explorerUrl}/tx/${executionTxHash}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={linkClass}
                  >
                    {`${executionTxHash.slice(0, 10)}…${executionTxHash.slice(-8)}`}
                    <ExternalLinkIcon boxSize={14} aria-hidden />
                  </a>
                ) : (
                  executionTxHash
                )}
              </dd>
            </div>
          ) : (
            explorerUrl != null && (
              <div>
                <a
                  href={`${explorerUrl}/address/${multiSigAddress}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={linkClass}
                >
                  View the wallet&apos;s transactions on the explorer
                  <ExternalLinkIcon boxSize={14} aria-hidden />
                </a>
              </div>
            )
          )}
        </dl>
      </div>
    </div>
  )
}

export default ExecutionOutcome
