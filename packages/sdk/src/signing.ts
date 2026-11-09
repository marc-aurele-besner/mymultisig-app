import { recoverTypedDataAddress, type LocalAccount } from 'viem'

import { buildTransactionTypedData, type ExecTransactionArgs, type TransactionTypedData } from './protocol'
import type { WalletInfo } from './types'

type Address = `0x${string}`

// The EIP-712 payload an owner signs to approve `args` on `wallet`. Same
// derivation as useSignedMultiSigRequest in the app: domain = the wallet's own
// name()/version(), nonce = the pinned txnNonce or the wallet's current nonce.
export const requestTypedData = (
  wallet: Pick<WalletInfo, 'chainId' | 'address' | 'name' | 'version' | 'nonce' | 'walletType'>,
  args: ExecTransactionArgs
): TransactionTypedData =>
  buildTransactionTypedData({
    domain: { name: wallet.name, version: wallet.version, chainId: wallet.chainId, verifyingContract: wallet.address },
    args,
    nonce: args.txnNonce != null && args.txnNonce !== '' ? BigInt(args.txnNonce) : wallet.nonce,
    walletVersion: wallet.version,
    isExtended: wallet.walletType === 'extended'
  })

export const signRequest = (account: LocalAccount, typedData: TransactionTypedData): Promise<`0x${string}`> =>
  // The struct shape is only known at runtime, so viem can't infer it here.
  account.signTypedData(typedData as Parameters<LocalAccount['signTypedData']>[0])

export type SignatureCheck = {
  signer: Address
  // 'valid': ECDSA recovers to the claimed signer, who is an owner.
  // 'not-owner': recovers to the claimed signer, but they aren't an owner.
  // 'mismatch': recovers to someone else (tampered or signed a different payload).
  // 'unverifiable': not a 65-byte ECDSA signature (e.g. an EIP-1271 blob from
  //   a nested-wallet owner); only the on-chain simulation can judge it.
  status: 'valid' | 'not-owner' | 'mismatch' | 'unverifiable'
  recovered?: Address
}

// The server stores signatures as the client sent them and never recovers
// them, so agents verify locally before combining or executing.
export const verifyRequestSignatures = async (
  typedData: TransactionTypedData,
  ownerSigners: string[],
  signatures: string[],
  owners: string[] | undefined
): Promise<SignatureCheck[]> => {
  const ownerSet = owners ? new Set(owners.map((o) => o.toLowerCase())) : undefined
  return Promise.all(
    signatures.map(async (signature, i): Promise<SignatureCheck> => {
      const signer = (ownerSigners[i] ?? '0x') as Address
      if (!/^0x[0-9a-fA-F]{130}$/.test(signature)) return { signer, status: 'unverifiable' }
      try {
        const recovered = await recoverTypedDataAddress({
          ...typedData,
          signature: signature as `0x${string}`
        } as unknown as Parameters<typeof recoverTypedDataAddress>[0])
        if (recovered.toLowerCase() !== signer.toLowerCase()) return { signer, status: 'mismatch', recovered }
        if (ownerSet && !ownerSet.has(recovered.toLowerCase())) return { signer, status: 'not-owner', recovered }
        return { signer, status: 'valid', recovered }
      } catch {
        return { signer, status: 'mismatch' }
      }
    })
  )
}
