import React from 'react'
import { Button } from '@/components/ui/button'

import { MultiSigExecTransactionArgs, MultiSigTransactionRequest } from '../../models/MultiSigs'
import useUserOpSigning from '../../hooks/useUserOpSigning'
import WalletActionNotice from './WalletActionNotice'

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
    <div className='flex flex-col items-center gap-2'>
      <Button
        variant='default'
        className='mr-8 mt-4'
        onClick={() => {
          // Clear the previous attempt's notice before prompting the wallet again.
          if (isError) reset()
          signMessage()
        }}
        disabled={isPrepareError || isPending || isSuccess}
      >
        {isSuccess
          ? 'Signed UserOp'
          : isPending
            ? 'Confirm in your wallet…'
            : isError
              ? 'Try again'
              : 'Sign UserOp'}
      </Button>
      {isPrepareError && prepareError != null && <p className='text-xs text-muted-foreground'>{prepareError}</p>}
      {isError && <WalletActionNotice error={error} action='signature' onDismiss={() => reset()} />}
    </div>
  )
}

export default SignUserOp
