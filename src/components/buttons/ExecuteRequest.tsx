import React, { Fragment } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MultiSigExecTransactionArgs, MultiSigTransactionRequest } from '../../models/MultiSigs'
import useExecTransaction from '../../hooks/useExecTransaction'

interface ExecuteRequestProps {
  multiSigAddress: `0x${string}`
  args: MultiSigExecTransactionArgs
  requestDetails: MultiSigTransactionRequest
  existingRequestRef: string
}

const ExecuteRequest: React.FC<ExecuteRequestProps> = ({
  multiSigAddress,
  args,
  requestDetails,
  existingRequestRef
}) => {
  const {
    preparationError,
    preparationIsError,
    isError,
    isPending,
    isSuccess,
    writeContract,
    reset
  } = useExecTransaction(
    args,
    multiSigAddress,
    requestDetails,
    existingRequestRef
  )

  const errorReason =
    preparationError != null && typeof preparationError === 'object' && 'reason' in preparationError
      ? String((preparationError as { reason?: string }).reason)
      : String(preparationError)

  return (
    <div className="flex justify-center">
      {isError && (
        <p className="pt-2 text-xl font-bold text-destructive">Something went wrong</p>
      )}
      {!preparationIsError ? (
        <Button
          variant="default"
          className="mr-8 mt-4"
          onClick={() => writeContract()}
          disabled={isPending || isSuccess}
        >
          Execute transaction request
        </Button>
      ) : (
        <div className="flex w-full flex-col gap-2">
          <p className="pt-2 text-lg font-bold text-foreground">
            There was an error preparing the transaction.
          </p>
          <Textarea
            readOnly
            value={errorReason}
            className="w-full text-destructive"
          />
          <Button variant="default" className="mr-8 mt-4" onClick={() => reset()}>
            Reset
          </Button>
        </div>
      )}
    </div>
  )
}

export default ExecuteRequest
