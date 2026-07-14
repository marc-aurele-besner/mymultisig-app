import { useEffect, useRef } from 'react'
import { useAccount, useChainId, useSignMessage } from 'wagmi'
import { toast } from 'sonner'

import { ensureSiweSession } from '../utils/siwe'
import { syncAddressBookWithRemote } from '../utils/addressBookSync'

// Once per connected account: establish a SIWE session (one free wallet
// signature proving ownership — the API rejects unverified writes), then pull
// the account's address book from Neon and push up local-only entries.
// Mounted globally in Layout.
const useAddressBookSync = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const { signMessageAsync } = useSignMessage()
  const syncedFor = useRef<string | null>(null)

  useEffect(() => {
    if (address == null || chainId == null) return
    if (syncedFor.current === address.toLowerCase()) return
    syncedFor.current = address.toLowerCase()
    void (async () => {
      const verified = await ensureSiweSession(address, chainId, signMessageAsync)
      if (verified) {
        await syncAddressBookWithRemote(address, chainId)
      } else {
        // Allow a retry on the next account change or reconnect.
        syncedFor.current = null
        toast.info('Wallet sign-in declined — your data will stay in this browser only until you sign in.')
      }
    })()
  }, [address, chainId, signMessageAsync])
}

export default useAddressBookSync
