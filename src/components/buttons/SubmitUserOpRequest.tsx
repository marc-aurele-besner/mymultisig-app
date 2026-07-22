import React from 'react'
import { Button } from '@/components/ui/button'

import { MultiSigTransactionRequest } from '../../models/MultiSigs'
import useSendUserOp from '../../hooks/useSendUserOp'

interface SubmitUserOpRequestProps {
  wallet: `0x${string}`
  entryPoint: `0x${string}`
  bundlerUrl: string
  paymasterUrl?: string
  walletVersion: string | undefined
  requestDetails: MultiSigTransactionRequest
  existingRequestId: string
}

// Mirrors ExecuteRequest for the UserOp path. The hook assembles the
// PackedUserOperation from the request's persisted userOpJson + signature
// blob, optionally calls pm_getPaymasterData, refines gas via the bundler,
// then sends and polls the receipt.
const SubmitUserOpRequest: React.FC<SubmitUserOpRequestProps> = ({
  wallet,
  entryPoint,
  bundlerUrl,
  paymasterUrl,
  walletVersion,
  requestDetails,
  existingRequestId
}) => {
  const { state, send } = useSendUserOp({
    request: requestDetails,
    entryPoint,
    bundlerUrl,
    paymasterUrl,
    walletVersion
  })

  const sending = state.status === 'estimating' || state.status === 'sending'
  const settled = state.status === 'mined' || state.status === 'failed'

  return (
    <div className='flex flex-col gap-2'>
      <Button
        variant='default'
        className='mr-8 mt-4'
        onClick={() => {
          void send()
        }}
        disabled={sending || settled}
      >
        {state.status === 'estimating' && 'Estimating gas...'}
        {state.status === 'sending' && 'Sending to bundler...'}
        {state.status === 'submitted' && 'Submitted — awaiting receipt'}
        {state.status === 'polling' && 'Submitted — awaiting receipt'}
        {state.status === 'mined' && 'Bundled and mined'}
        {state.status === 'failed' && 'Send failed — try again'}
        {state.status === 'idle' && 'Send to bundler'}
      </Button>
      {state.status === 'failed' && <p className='text-sm text-destructive'>{state.reason}</p>}
      {state.status === 'mined' && <p className='text-sm text-primary'>Bundled in tx {state.receipt.txHash}</p>}
    </div>
  )
}

export default SubmitUserOpRequest
