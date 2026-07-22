import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'

import useRevokeUserOpHash from '../../hooks/useRevokeUserOpHash'

interface RevokeUserOpApprovalProps {
  multiSigAddress: `0x${string}`
  userOpSigningHash: `0x${string}`
  onRevoked?: () => void
}

// 0.5.0 wallets only: withdraws the connected owner's on-chain approval of
// a UserOp digest without burning the EntryPoint nonce. Self-only — the
// wallet reverts with NotApproved() for a digest the owner never approved.
const RevokeUserOpApproval: React.FC<RevokeUserOpApprovalProps> = ({
  multiSigAddress,
  userOpSigningHash,
  onRevoked
}) => {
  const { writeContract, isPending, isFinal } = useRevokeUserOpHash(multiSigAddress, userOpSigningHash)

  useEffect(() => {
    if (isFinal && onRevoked) onRevoked()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinal])

  return (
    <Button variant='outline' className='mr-8 mt-4' onClick={() => writeContract()} disabled={isPending || isFinal}>
      {isFinal ? 'Approval revoked' : isPending ? 'Confirm in your wallet...' : 'Revoke my UserOp approval'}
    </Button>
  )
}

export default RevokeUserOpApproval
