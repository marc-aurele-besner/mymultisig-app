import React from 'react'
import { Button } from '@/components/ui/button'
import { LoadingDots } from '@/components/ui/loading-dots'
import { MultiSigExecTransactionArgs, MultiSigTransactionRequest } from '../../models/MultiSigs'
import useSignedMultiSigRequest from '../../hooks/useSignedMultiSigRequest'
import WalletActionNotice from './WalletActionNotice'

interface MultiSigListProps {
  multiSigAddress: `0x${string}`
  args: MultiSigExecTransactionArgs
  description: string
  requestDetails?: MultiSigTransactionRequest
  existingRequestId?: string
  onSaved?: (request: MultiSigTransactionRequest) => void
}

const SignRequest: React.FC<MultiSigListProps> = ({
  multiSigAddress,
  args,
  description,
  requestDetails,
  existingRequestId,
  onSaved
}) => {
  const {
    isPrepareError,
    isError,
    error,
    isPending,
    isSuccess,
    signTypedData,
    saveState,
    saveError,
    retrySave,
    reset
  } = useSignedMultiSigRequest(multiSigAddress, args, description, requestDetails, existingRequestId, { onSaved })

  // The wallet signed, but the API refused or failed to store the request.
  // Owners cannot see it yet, so say so and offer to save the same signature again.
  if (saveState === 'failed') {
    return (
      <div className='flex flex-col items-center gap-2'>
        <p className='pt-2 text-xl font-bold text-destructive'>Signed, but the request was not saved</p>
        <p className='max-w-md text-center text-sm text-muted-foreground'>
          The other owners cannot see this request yet. Your signature is kept, so saving again does not ask you to
          sign.
        </p>
        {saveError != null && <p className='text-sm text-destructive'>{saveError}</p>}
        <Button variant='default' className='mr-8 mt-4' onClick={() => retrySave()}>
          Save request again
        </Button>
      </div>
    )
  }

  if (saveState === 'saving') {
    return (
      <div className='flex justify-center'>
        <LoadingDots label='Saving request...' />
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center gap-2'>
      <Button
        variant='default'
        className='mr-8 mt-4'
        onClick={() => {
          // Clear the previous attempt's notice before prompting the wallet again.
          if (isError) reset()
          signTypedData()
        }}
        disabled={isPrepareError || isPending || isSuccess}
      >
        {isPending ? 'Confirm in your wallet…' : isError ? 'Try again' : 'Sign transaction request'}
      </Button>
      {isPrepareError && <p className='text-xs text-muted-foreground'>Enter a valid value and gas to sign.</p>}
      {isError && <WalletActionNotice error={error} action='signature' onDismiss={() => reset()} />}
    </div>
  )
}

export default SignRequest
