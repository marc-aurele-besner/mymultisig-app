import { MultiSig } from '../models/MultiSigs'
import { patchMultiSigWallet } from './api'

// Mirrors a local wallet patch (owners, threshold, policy, ...) into Neon so it
// survives a store reset and feeds the server-side owner-only request guard.
const persistMultiSigWalletPatch = (chainId: number, address: `0x${string}`, patch: Partial<MultiSig>) =>
  patchMultiSigWallet({ address, chainId, ...patch }).catch((error) =>
    console.error('Failed to persist wallet update', error)
  )

export default persistMultiSigWalletPatch
