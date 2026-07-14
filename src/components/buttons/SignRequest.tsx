import React, { Fragment } from 'react'
import { Button } from '@/components/ui/button'
import { MultiSigExecTransactionArgs, MultiSigTransactionRequest } from '../../models/MultiSigs'
import useSignedMultiSigRequest from '../../hooks/useSignedMultiSigRequest'

interface MultiSigListProps {
  multiSigAddress: `0x${string}`
  args: MultiSigExecTransactionArgs
  description: string
  requestDetails?: MultiSigTransactionRequest
  existingRequestId?: string
}

const SignRequest: React.FC<MultiSigListProps> = ({
  multiSigAddress,
  args,
  description,
  requestDetails,
  existingRequestId
}) => {
  const {
    isPrepareError,
    isError,
    prepareError,
    error,
    isPending,
    isSuccess,
    signTypedData,
    reset
  } = useSignedMultiSigRequest(
    multiSigAddress,
    args,
    description,
    requestDetails,
    existingRequestId
  )

  return (
    <div className="flex justify-center">
      {isPrepareError || isError ? (
        <div className="flex flex-col items-center gap-2">
          <p className="pt-2 text-xl font-bold text-destructive">Something went wrong</p>
          {error != null && (
            <p className="pt-2 text-lg text-destructive">{JSON.stringify(error)}</p>
          )}
          {prepareError != null && (
            <p className="pt-2 text-lg text-destructive">{String(prepareError)}</p>
          )}
          <Button
            variant="default"
            className="mr-8 mt-4"
            onClick={() => reset()}
            disabled={isPending || isSuccess}
          >
            Try again
          </Button>
        </div>
      ) : (
        <Button
          variant="default"
          className="mr-8 mt-4"
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
