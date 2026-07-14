import { useEffect, useRef } from 'react'
import { useAccount, useChainId } from 'wagmi'

import { syncAddressBookWithRemote } from '../utils/addressBookSync'

// Pulls the connected account's address book from Neon once per account and
// pushes up local-only entries. Mounted globally in Layout.
const useAddressBookSync = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const syncedFor = useRef<string | null>(null)

  useEffect(() => {
    if (address == null || chainId == null) return
    if (syncedFor.current === address.toLowerCase()) return
    syncedFor.current = address.toLowerCase()
    void syncAddressBookWithRemote(address, chainId)
  }, [address, chainId])
}

export default useAddressBookSync
