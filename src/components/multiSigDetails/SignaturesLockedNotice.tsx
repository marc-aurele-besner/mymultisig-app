import React, { useState } from 'react'
import { useAccount, useChainId, useSignMessage } from 'wagmi'
import { Button } from '@/components/ui/button'

import { ensureSiweSession } from '../../utils/siwe'

interface SignaturesLockedNoticeProps {
  // The connected wallet is an owner of this multisig: it gets a sign-in
  // button, everyone else an explanation.
  isOwner: boolean
}

// Shown in place of the sign / execute actions when the request was loaded
// without its signatures. The request reads only share raw signatures with
// the wallet's signed-in owners, because anyone holding them could submit
// the transaction. Signing in fires the session event, and the request
// views refetch on it.
const SignaturesLockedNotice: React.FC<SignaturesLockedNoticeProps> = ({ isOwner }) => {
  const { address } = useAccount()
  const chainId = useChainId()
  const { signMessageAsync } = useSignMessage()
  const [state, setState] = useState<'idle' | 'pending' | 'declined'>('idle')

  if (!isOwner) {
    return (
      <p className='text-sm text-muted-foreground'>
        Only owners of this wallet can see the collected signatures, so signing and executing happen from an owner
        wallet.
      </p>
    )
  }

  const signIn = async () => {
    if (address == null) return
    setState('pending')
    const ok = await ensureSiweSession(address, chainId, signMessageAsync)
    setState(ok ? 'idle' : 'declined')
  }

  return (
    <div className='flex flex-col gap-2'>
      <p className='text-sm text-muted-foreground'>
        Collected signatures are only shared with signed-in owners. Sign in with this wallet to load them before you
        sign or execute. It is free and sends no transaction.
      </p>
      <div>
        <Button variant='default' onClick={() => void signIn()} disabled={address == null || state === 'pending'}>
          {state === 'pending' ? 'Confirm in your wallet…' : 'Sign in to load signatures'}
        </Button>
      </div>
      {state === 'declined' && <p className='text-sm text-destructive'>Sign-in was declined or failed. Try again.</p>}
    </div>
  )
}

export default SignaturesLockedNotice
