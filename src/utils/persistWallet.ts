import { MultiSig } from '../models/MultiSigs'
import { signData, addContent } from './api'

// Mirrors a local wallet patch (owners, threshold, policy, ...) into Neon so it
// survives a store reset and feeds the server-side owner-only request guard.
const persistMultiSigWalletPatch = (chainId: number, address: `0x${string}`, patch: Partial<MultiSig>) =>
  signData({
    action: 'updateMultiSigWallet',
    chainId,
    collection: 'multisig-wallets',
    data: { address, chainId, ...patch },
    details: 'Update MultiSig Wallet',
    signatureExpiry: 0
  })
    .then((dataSigned) => addContent(dataSigned.message))
    .catch((error) => console.error('Failed to persist wallet update', error))

export default persistMultiSigWalletPatch
