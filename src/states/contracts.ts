import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { Contract } from '../models/Contracts'
import contracts from '../constants/contracts'

interface ContractDefaultState {
  contracts: Contract[]
}

interface ContractState extends ContractDefaultState {
  setContract: (contracts: Contract[]) => void
  addContract: (contract: Contract) => void
  clearContract: () => void
}

const initialState: ContractDefaultState = {
  contracts
}

const useContracts = create<ContractState>()(
  persist(
    (set) => ({
      ...initialState,
      setContract: (contracts) => set(() => ({ contracts })),
      addContract: (contract) =>
        set((state) => ({
          contracts: [...state.contracts, contract]
        })),
      clearContract: () => set(() => ({ ...initialState }))
    }),
    {
      name: 'contracts-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export default useContracts
