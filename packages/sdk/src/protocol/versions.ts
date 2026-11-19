// Deployed wallets are frozen at the contract version they were built from
// (version() returns '0.0.4' ... '0.1.3' for pre-0.5.0 deployments, '0.5.0'
// after), so every protocol surface that changed in 0.5.0 — EIP-712 typehash,
// signature blob encoding, execTransaction overloads — must branch on the
// wallet's reported version rather than the npm package's.

const parseVersion = (version: string): number[] =>
  version
    .trim()
    .split('.')
    .map((part) => Number(part.replace(/[^0-9].*$/, '')) || 0)

export const gteVersion = (version: string | undefined, target: string): boolean => {
  if (version == null || version === '') return false
  const a = parseVersion(version)
  const b = parseVersion(target)
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0)
    if (diff !== 0) return diff > 0
  }
  return true
}

// 0.5.0 wallets: validUntil + operation in the typehash, tuple-encoded
// signature blobs, timelock/guard/allowance/module surface, ERC-4337.
// No 0.2.x–0.4.x wallets were ever deployed (the package jumped 0.1.4→0.5.0),
// so a single cutoff covers every breaking change in between.
export const isModernWallet = (version: string | undefined): boolean => gteVersion(version, '0.5.0')

// 0.5.1 wallets bind EIP-1271 owner votes to the wallet: isValidSignature(hash,
// sig) checks each vote against getMessageHash(abi.encode(hash)), the EIP-712
// MyMultiSigMessage(bytes message) hash under the wallet's own domain. 0.5.0
// wallets check votes against the raw hash, so a vote blob is valid on every
// wallet with the same owners, and an owner's own EOA signature over a hash
// (a Permit2 permit, say) also counts as a wallet vote. The app only offers
// off-chain votes on wallets from this version on.
export const WALLET_BOUND_EIP1271_FROM_VERSION = '0.5.1'
export const hasWalletBoundEip1271 = (version: string | undefined): boolean =>
  gteVersion(version, WALLET_BOUND_EIP1271_FROM_VERSION)

// 0.5.0 factories take an entryPoint on createMyMultiSigExtended and expose
// createMyMultiSigAdvanced + per-type bookkeeping.
export const isModernFactory = (version: string | undefined): boolean => gteVersion(version, '0.5.0')
