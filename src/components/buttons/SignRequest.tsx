import React from 'react'
import { Button } from '@/components/ui/button'
import { LoadingDots } from '@/components/ui/loading-dots'
import { MultiSigExecTransactionArgs, MultiSigTransactionRequest } from '../../models/MultiSigs'
import useSignedMultiSigRequest from '../../hooks/useSignedMultiSigRequest'

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
    prepareError,
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
    <div className='flex justify-center'>
      {isPrepareError || isError ? (
        <div className='flex flex-col items-center gap-2'>
          <p className='pt-2 text-xl font-bold text-destructive'>Something went wrong</p>
          {error != null && <p className='pt-2 text-lg text-destructive'>{JSON.stringify(error)}</p>}
          {prepareError != null && <p className='pt-2 text-lg text-destructive'>{String(prepareError)}</p>}
          <Button variant='default' className='mr-8 mt-4' onClick={() => reset()} disabled={isPending || isSuccess}>
            Try again
          </Button>
        </div>
      ) : (
        <Button
          variant='default'
          className='mr-8 mt-4'
          onClick={() => signTypedData()}
          disabled={isPending || isSuccess}
        >
          Sign transaction request
        </Button>
      )}
    </div>
  )
}

export default SignRequest
