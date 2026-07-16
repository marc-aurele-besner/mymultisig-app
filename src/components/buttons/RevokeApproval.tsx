import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'

import useRevokeApproval from '../../hooks/useRevokeApproval'

interface RevokeApprovalProps {
  multiSigAddress: `0x${string}`
  txHash: `0x${string}`
  onRevoked?: () => void
}

// Withdraws the connected owner's on-chain approval of a request (0.5.0
// wallets). The counterpart to ApproveRequest — it frees the owner's vote
// without burning the whole nonce.
const RevokeApproval: React.FC<RevokeApprovalProps> = ({ multiSigAddress, txHash, onRevoked }) => {
  const { writeContract, isPending, isFinal } = useRevokeApproval(multiSigAddress, txHash)

  useEffect(() => {
    if (isFinal && onRevoked) onRevoked()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinal])

  return (
    <Button variant='outline' className='mr-8 mt-4' onClick={() => writeContract()} disabled={isPending || isFinal}>
      {isFinal ? 'Approval revoked' : isPending ? 'Confirm in your wallet...' : 'Revoke my approval'}
    </Button>
  )
}

export default RevokeApproval
