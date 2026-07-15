import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 } from 'uuid'

export type AddressBookEntryKind = 'wallet' | 'contract'

export type AddressBookEntry = {
  id: string
  chainId: number
  address: `0x${string}`
  label: string
  kind: AddressBookEntryKind
  // Public entries may be reviewed by MyMultiSig admins so widely shared
  // contracts can be officially supported. Optional so entries persisted
  // before the flag existed stay valid; absent means private.
  isPublic?: boolean
}

interface AddressBookDefaultState {
  entries: AddressBookEntry[]
}

interface AddressBookState extends AddressBookDefaultState {
  addEntry: (entry: Omit<AddressBookEntry, 'id'>) => void
  updateEntry: (id: string, patch: Partial<Omit<AddressBookEntry, 'id'>>) => void
  removeEntry: (id: string) => void
  clearAll: () => void
}

const initialState: AddressBookDefaultState = {
  entries: []
}

// Browser-local address book: labels for receivers and contracts, keyed by
// chain + address. Entries are shared across every multisig in this browser.
const useAddressBook = create<AddressBookState>()(
  persist(
    (set) => ({
      ...initialState,
      addEntry: (entry) =>
        set((state) => ({
          entries: state.entries.some(
            (e) => e.chainId === entry.chainId && e.address.toLowerCase() === entry.address.toLowerCase()
          )
            ? state.entries
            : [...state.entries, { ...entry, id: v4() }]
        })),
      updateEntry: (id, patch) =>
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? { ...e, ...patch } : e))
        })),
      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id)
        })),
      clearAll: () => set(() => ({ ...initialState }))
    }),
    {
      name: 'addressBook-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

// Chain-scoped label lookup for rendering addresses human-readably.
export const useAddressLabels = (chainId: number | undefined) => {
  const entries = useAddressBook((state) => state.entries)
  const scoped = chainId != null ? entries.filter((e) => e.chainId === chainId) : []
  const labelFor = (address: string): string | undefined =>
    scoped.find((e) => e.address.toLowerCase() === address.toLowerCase())?.label
  return { entries: scoped, labelFor }
}

export default useAddressBook
