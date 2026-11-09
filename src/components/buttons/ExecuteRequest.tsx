import React from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MultiSigExecTransactionArgs, MultiSigTransactionRequest } from '../../models/MultiSigs'
import useExecTransaction from '../../hooks/useExecTransaction'
import WalletActionNotice from './WalletActionNotice'

interface ExecuteRequestProps {
  multiSigAddress: `0x${string}`
  args: MultiSigExecTransactionArgs
  requestDetails: MultiSigTransactionRequest
  existingRequestId: string
}

const ExecuteRequest: React.FC<ExecuteRequestProps> = ({
  multiSigAddress,
  args,
  requestDetails,
  existingRequestId
}) => {
  const {
    preparationError,
    preparationIsError,
    error,
    isError,
    isPending,
    isSuccess,
    writeContract,
    reset
  } = useExecTransaction(
    args,
    multiSigAddress,
    requestDetails,
    existingRequestId
  )

  const errorReason =
    preparationError != null && typeof preparationError === 'object' && 'reason' in preparationError
      ? String((preparationError as { reason?: string }).reason)
      : String(preparationError)

  if (preparationIsError) {
    return (
      <div className="flex w-full flex-col gap-2">
        <p className="pt-2 text-lg font-bold text-foreground">There was an error preparing the transaction.</p>
        <Textarea readOnly value={errorReason} className="w-full text-destructive" />
        <Button variant="default" className="mr-8 mt-4" onClick={() => reset()}>
          Reset
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <Button
        variant="default"
        onClick={() => {
          // Clear the previous attempt's notice before prompting the wallet again.
          if (isError) reset()
          writeContract()
        }}
        disabled={isPending || isSuccess}
      >
        {isPending ? 'Confirm in your wallet…' : isError ? 'Try again' : 'Execute transaction request'}
      </Button>
      {isError && <WalletActionNotice error={error} action="execution" onDismiss={() => reset()} />}
    </div>
  )
}

export default ExecuteRequest
