import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'

import useApproveUserOpHash from '../../hooks/useApproveUserOpHash'

interface ApproveUserOpRequestProps {
  multiSigAddress: `0x${string}`
  userOpSigningHash: `0x${string}`
  onApproved?: () => void
}

// On-chain pre-approval of a UserOp digest. Callers (the request detail
// view) hand us the `userOpSigningHash` (= `EIP191(userOpHash)`) the wallet
// returns from `userOpSigningHash`; on-chain approval binds the same digest
// the off-chain ECDSA path signs.
const ApproveUserOpRequest: React.FC<ApproveUserOpRequestProps> = ({
  multiSigAddress,
  userOpSigningHash,
  onApproved
}) => {
  const { writeContract, isPending, isFinal } = useApproveUserOpHash(multiSigAddress, userOpSigningHash)

  useEffect(() => {
    if (isFinal && onApproved) onApproved()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinal])

  return (
    <Button variant='outline' className='mr-8 mt-4' onClick={() => writeContract()} disabled={isPending || isFinal}>
      {isFinal ? 'Approved on-chain' : isPending ? 'Confirm in your wallet...' : 'Approve UserOp on-chain'}
    </Button>
  )
}

export default ApproveUserOpRequest
