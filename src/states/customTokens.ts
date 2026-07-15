import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { CustomToken } from '../models/Assets'

interface CustomTokensDefaultState {
  tokens: CustomToken[]
}

interface CustomTokensState extends CustomTokensDefaultState {
  addToken: (token: CustomToken) => void
  removeToken: (chainId: number, address: string) => void
  clearTokens: () => void
}

const initialState: CustomTokensDefaultState = {
  tokens: []
}

const sameToken = (token: CustomToken, chainId: number, address: string) =>
  token.chainId === chainId && token.address.toLowerCase() === address.toLowerCase()

const useCustomTokens = create<CustomTokensState>()(
  persist(
    (set) => ({
      ...initialState,
      addToken: (token) =>
        set((state) => ({
          tokens: [...state.tokens.filter((t) => !sameToken(t, token.chainId, token.address)), token]
        })),
      removeToken: (chainId, address) =>
        set((state) => ({
          tokens: state.tokens.filter((t) => !sameToken(t, chainId, address))
        })),
      clearTokens: () => set(() => ({ ...initialState }))
    }),
    {
      name: 'custom-tokens-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export default useCustomTokens
