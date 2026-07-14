import { useEffect, useRef } from 'react'
import { useAccount, useChainId, useSignMessage } from 'wagmi'
import { toast } from 'sonner'

import { ensureSiweSession } from '../utils/siwe'
import { syncAddressBookWithRemote } from '../utils/addressBookSync'
import { syncWalletsWithRemote, syncSavedContractsWithRemote, syncFactoriesWithRemote } from '../utils/accountSync'

// Once per connected account: establish a SIWE session (one free wallet
// signature proving ownership — the API rejects unverified access), then sync
// the account's DB-backed data both ways: wallets, address book, saved
// contracts, and user-deployed factories. Mounted globally in Layout.
const useAccountSync = () => {
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
        await Promise.all([
          syncWalletsWithRemote(address, chainId),
          syncAddressBookWithRemote(address, chainId),
          syncSavedContractsWithRemote(address, chainId),
          syncFactoriesWithRemote(address, chainId)
        ])
      } else {
        // Allow a retry on the next account change or reconnect.
        syncedFor.current = null
        toast.info('Wallet sign-in declined — your data will stay in this browser only until you sign in.')
      }
    })()
  }, [address, chainId, signMessageAsync])
}

export default useAccountSync
