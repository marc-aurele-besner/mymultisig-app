import useAddressBook, { AddressBookEntry } from '../states/addressBook'
import { addContent, getContent } from './index'

// Mirrors address-book mutations to Neon so labels follow the user across
// browsers. The local Zustand store stays the source of truth for rendering;
// every remote write is fire-and-forget (the book still works offline).
// Rows are keyed by (ownerAddress, chainId, address), so no id mapping is
// needed between the local store and the database.

const push = (action: 'addAddressBookEntry' | 'removeAddressBookEntry', data: object) =>
  addContent({ action, data }).catch(() => {
    // DB persistence is best-effort; the local store already has the change.
  })

export const persistAddressBookUpsert = (entry: Omit<AddressBookEntry, 'id'>, ownerAddress: string | undefined) => {
  if (ownerAddress == null) return
  void push('addAddressBookEntry', { ...entry, ownerAddress })
}

export const persistAddressBookRemoval = (
  entry: Pick<AddressBookEntry, 'chainId' | 'address'>,
  ownerAddress: string | undefined
) => {
  if (ownerAddress == null) return
  void push('removeAddressBookEntry', {
    chainId: entry.chainId,
    address: entry.address,
    ownerAddress
  })
}

// Two-way initial sync: pull the remote book into the local store, then push
// local-only entries (e.g. saved while signed out or on another network) up.
export const syncAddressBookWithRemote = async (ownerAddress: string, chainId: number) => {
  try {
    const response = await getContent({ action: 'getAddressBook', data: { ownerAddress } })
    if (response?.content == null || !Array.isArray(response.content)) return
    const remote = response.content as AddressBookEntry[]
    const { entries, addEntry } = useAddressBook.getState()
    const localKey = (e: { chainId: number; address: string }) => `${e.chainId}-${e.address.toLowerCase()}`
    const localKeys = new Set(entries.map(localKey))
    const remoteKeys = new Set(remote.map(localKey))
    remote
      .filter((e) => !localKeys.has(localKey(e)))
      .forEach((e) =>
        addEntry({
          chainId: e.chainId,
          address: e.address,
          label: e.label,
          kind: e.kind === 'contract' ? 'contract' : 'wallet',
          isPublic: e.isPublic === true
        })
      )
    entries.filter((e) => !remoteKeys.has(localKey(e))).forEach((e) => persistAddressBookUpsert(e, ownerAddress))
  } catch {
    // Offline or DB unavailable; the local book keeps working.
  }
}
