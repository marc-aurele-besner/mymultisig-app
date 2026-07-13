import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'

import useApproveHash from '../../hooks/useApproveHash'

interface ApproveRequestProps {
  multiSigAddress: `0x${string}`
  txHash: `0x${string}`
  onApproved?: () => void
}

// Records the connected owner's approval on-chain via approveHash. Useful for
// hardware wallets or owners who prefer a transaction over an EIP-712
// signature; approvals count toward the threshold alongside collected
// signatures.
const ApproveRequest: React.FC<ApproveRequestProps> = ({ multiSigAddress, txHash, onApproved }) => {
  const { writeContract, isPending, isFinal } = useApproveHash(multiSigAddress, txHash)

  useEffect(() => {
    if (isFinal && onApproved) onApproved()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinal])

  return (
    <Button variant='outline' className='mr-8 mt-4' onClick={() => writeContract()} disabled={isPending || isFinal}>
      {isFinal ? 'Approved on-chain' : isPending ? 'Confirm in your wallet...' : 'Approve on-chain'}
    </Button>
  )
}

export default ApproveRequest
