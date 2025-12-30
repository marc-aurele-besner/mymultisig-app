import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { MultiSigFactory, MultiSig, MultiSigTransactionRequest } from '../models/MultiSigs'
import multiSigFactories from '../constants/multiSigFactory'

interface MultiSigDefaultState {
  multiSigFactory: MultiSigFactory[]
  multiSigs: MultiSig[]
  selectedMultiSigAddress: `0x${string}` | null
  multiSigTransactionRequests: MultiSigTransactionRequest[]
  selectedMultiSigTransactionRequest: string | null
}

interface MultiSigState extends MultiSigDefaultState {
  setMultiSigFactory: (multiSigFactory: MultiSigFactory[]) => void
  addMultiSigFactory: (multiSigFactory: MultiSigFactory) => void
  setMultiSigs: (multiSigs: MultiSig[]) => void
  addMultiSig: (multiSig: MultiSig) => void
  clearAllMultiSig: () => void
  setSelectedMultiSigAddress: (selectedMultiSigAddress: `0x${string}` | null) => void
  setMultiSigTransactionRequests: (multiSigTransactionRequests: MultiSigTransactionRequest[]) => void
  addMultiSigTransactionRequest: (multiSigTransactionRequest: MultiSigTransactionRequest) => void
  updateMultiSigTransactionRequest: (id: string, multiSigTransactionRequest: MultiSigTransactionRequest) => void
  removeMultiSigTransactionRequest: (id: string) => void
  setSelectedMultiSigTransactionRequest: (selectedMultiSigTransactionRequest: string | null) => void
  clearAllMultiSigTransactionRequests: () => void
}

const initialState: MultiSigDefaultState = {
  multiSigFactory: multiSigFactories,
  multiSigs: [],
  selectedMultiSigAddress: null,
  multiSigTransactionRequests: [],
  selectedMultiSigTransactionRequest: null
}

const useMultiSigs = create<MultiSigState>()(
  persist(
    (set) => ({
      ...initialState,
      setMultiSigFactory: (multiSigFactory) => set(() => ({ multiSigFactory })),
      addMultiSigFactory: (multiSigFactory) =>
        set((state) => ({
          multiSigFactory: [...state.multiSigFactory, multiSigFactory]
        })),
      setMultiSigs: (multiSigs) => set(() => ({ multiSigs })),
      addMultiSig: (multiSig) =>
        set((state) => ({
          multiSigs: [...state.multiSigs, multiSig]
        })),
      clearAllMultiSig: () => set(() => ({ ...initialState })),
      setSelectedMultiSigAddress: (selectedMultiSigAddress) => set(() => ({ selectedMultiSigAddress })),
      setMultiSigTransactionRequests: (multiSigTransactionRequests) => set(() => ({ multiSigTransactionRequests })),
      addMultiSigTransactionRequest: (multiSigTransactionRequest) =>
        set((state) => ({
          multiSigTransactionRequests: [...state.multiSigTransactionRequests, multiSigTransactionRequest]
        })),
      updateMultiSigTransactionRequest: (id, multiSigTransactionRequest) =>
        set((state) => ({
          multiSigTransactionRequests: state.multiSigTransactionRequests.map((item) =>
            item.id === id ? multiSigTransactionRequest : item
          )
        })),
      removeMultiSigTransactionRequest: (id) =>
        set((state) => ({
          multiSigTransactionRequests: state.multiSigTransactionRequests.filter((item) => item.id !== id)
        })),
      setSelectedMultiSigTransactionRequest: (selectedMultiSigTransactionRequest) =>
        set(() => ({ selectedMultiSigTransactionRequest })),
      clearAllMultiSigTransactionRequests: () => set(() => ({ ...initialState }))
    }),
    {
      name: 'multiSigs-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export default useMultiSigs
