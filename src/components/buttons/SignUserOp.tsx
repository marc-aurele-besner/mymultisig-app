import React from 'react'
import { Button } from '@/components/ui/button'

import { MultiSigExecTransactionArgs, MultiSigTransactionRequest } from '../../models/MultiSigs'
import useUserOpSigning from '../../hooks/useUserOpSigning'

interface SignUserOpProps {
  wallet: `0x${string}`
  entryPoint: `0x${string}`
  nonce: bigint | undefined
  args: MultiSigExecTransactionArgs
  description: string
  requestDetails?: MultiSigTransactionRequest
  existingRequestId?: string
  bundlerUrl?: string
  paymasterUrl?: string
}

// Mirrors SignRequest for the UserOp path: each owner presses Sign, signs
// the EntryPoint userOpHash via personal_sign, and the vote is appended to
// the request's signature blob. Once the threshold is reached, the
// SubmitUserOpRequest button sends the combined blob to the bundler.
const SignUserOp: React.FC<SignUserOpProps> = ({
  wallet,
  entryPoint,
  nonce,
  args,
  description,
  requestDetails,
  existingRequestId,
  bundlerUrl,
  paymasterUrl
}) => {
  const { isPrepareError, isError, prepareError, error, isPending, isSuccess, signMessage, reset } = useUserOpSigning({
    wallet,
    entryPoint,
    args,
    description,
    ...(requestDetails != null ? { existingRequest: requestDetails } : {}),
    ...(existingRequestId != null ? { existingRequestId } : {}),
    nonce,
    bundlerUrl,
    paymasterUrl
  })

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
        <Button variant='default' className='mr-8 mt-4' onClick={() => signMessage()} disabled={isPending || isSuccess}>
          {isSuccess ? 'Signed UserOp' : 'Sign UserOp'}
        </Button>
      )}
    </div>
  )
}

export default SignUserOp
