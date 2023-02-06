import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

import { MultiSigFactory, MultiSig } from '../models/MultiSigs'
import multiSigFactories from '../constants/multiSigFactory'

interface MultiSigDefaultState {
  multiSigFactory: MultiSigFactory[]
  multiSigs: MultiSig[]
}

interface MultiSigState extends MultiSigDefaultState {
  setMultiSigFactory: (multiSigFactory: MultiSigFactory[]) => void
  addMultiSigFactory: (multiSigFactory: MultiSigFactory) => void
  setMultiSigs: (multiSigs: MultiSig[]) => void
  addMultiSig: (multiSig: MultiSig) => void
}

const initialState: MultiSigDefaultState = {
  multiSigFactory: multiSigFactories,
  multiSigs: [],
}

const useMultiSigs = create<MultiSigState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setMultiSigFactory: (multiSigFactory) => set(() => ({ multiSigFactory })),
        addMultiSigFactory: (multiSigFactory) =>
          set((state) => ({
            multiSigFactory: [...state.multiSigFactory, multiSigFactory],
          })),
        setMultiSigs: (multiSigs) => set(() => ({ multiSigs })),
        addMultiSig: (multiSig) =>
          set((state) => ({
            multiSigs: [...state.multiSigs, multiSig],
          })),
      }),
      {
        name: 'multiSigs-storage',
        storage: createJSONStorage(() => localStorage),
      },
    ),
  ),
)

export default useMultiSigs
