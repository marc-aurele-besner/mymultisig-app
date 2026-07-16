import React from 'react'
import { Button } from '@/components/ui/button'

import useScheduledTransaction, { SCHEDULE_EXECUTED_SENTINEL } from '../../hooks/useScheduledTransaction'
import useWalletType from '../../hooks/useWalletType'
import { MultiSigTransactionRequest } from '../../models/MultiSigs'

interface ScheduledExecutionPanelProps {
  multiSigAddress: `0x${string}`
  request: MultiSigTransactionRequest
  txHash: `0x${string}`
  thresholdReached: boolean
}

// Timelock flow for 0.5.0 Extended wallets: when the wallet has a timelock
// delay configured, sensitive calls cannot run through the direct execute
// button — they must be scheduled with the collected signatures, wait out the
// delay, then be executed. Renders nothing when the wallet has no timelock.
const ScheduledExecutionPanel: React.FC<ScheduledExecutionPanelProps> = ({
  multiSigAddress,
  request,
  txHash,
  thresholdReached
}) => {
  const { walletType } = useWalletType(multiSigAddress)
  const {
    timelockEnabled,
    timelockDelay,
    looksSensitive,
    readyAt,
    ready,
    schedule,
    executeScheduled,
    cancelScheduled,
    refetchReadyAt
  } = useScheduledTransaction(multiSigAddress, request, txHash, walletType === 'extended')

  if (walletType !== 'extended' || !timelockEnabled) return null

  const nowSeconds = BigInt(Math.floor(Date.now() / 1000))
  const isScheduled = readyAt != null && readyAt > 0n
  const isExecutedViaSchedule = readyAt != null && readyAt === SCHEDULE_EXECUTED_SENTINEL
  const isReady = isScheduled && !isExecutedViaSchedule && readyAt <= nowSeconds
  const formatDelay = (seconds: bigint) =>
    seconds >= 86400n ? `${Number(seconds / 86400n)} day${seconds >= 172800n ? 's' : ''}` : `${Number(seconds)} seconds`

  return (
    <div className='mt-2 flex flex-col gap-2 rounded-lg border border-border p-3'>
      <span className='text-xl font-bold text-foreground'>Timelock</span>
      <p className='text-sm text-muted-foreground'>
        This wallet enforces a {timelockDelay != null ? formatDelay(timelockDelay) : ''} timelock on sensitive calls
        (privileged self-calls and large transfers).{' '}
        {looksSensitive
          ? 'This request looks sensitive: a direct execution will revert — schedule it instead.'
          : 'If a direct execution reverts with SensitiveCallRequiresDelay, schedule it here.'}
      </p>

      {isExecutedViaSchedule ? (
        <span className='text-sm font-semibold text-primary'>This request was executed through the timelock.</span>
      ) : !isScheduled ? (
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            variant='outline'
            disabled={!thresholdReached || !ready || schedule.isPending || schedule.isSuccess}
            onClick={() => schedule.writeContract()}
          >
            {schedule.isPending ? 'Confirm in your wallet...' : 'Schedule with collected signatures'}
          </Button>
          {!thresholdReached && (
            <span className='text-xs text-muted-foreground'>
              Scheduling consumes the same {`owner signatures`} as a direct execution — reach the threshold first.
            </span>
          )}
        </div>
      ) : (
        <div className='flex flex-wrap items-center gap-2'>
          <span className={`text-sm font-semibold ${isReady ? 'text-primary' : 'text-foreground'}`}>
            {isReady
              ? 'The timelock has elapsed — this request can be executed.'
              : `Scheduled — executable after ${new Date(Number(readyAt) * 1000).toLocaleString()}.`}
          </span>
          {isReady && (
            <Button
              disabled={executeScheduled.isPending || executeScheduled.isSuccess}
              onClick={() => executeScheduled.writeContract()}
            >
              {executeScheduled.isPending ? 'Confirm in your wallet...' : 'Execute scheduled request'}
            </Button>
          )}
          <Button
            variant='destructive'
            disabled={cancelScheduled.isPending || cancelScheduled.isSuccess}
            onClick={() => {
              cancelScheduled.writeContract()
              refetchReadyAt()
            }}
          >
            Cancel schedule
          </Button>
        </div>
      )}
    </div>
  )
}

export default ScheduledExecutionPanel
