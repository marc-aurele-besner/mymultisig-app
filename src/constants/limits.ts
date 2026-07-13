// MyMultiSig nonces are uint96; the contract starts emitting ContractEndOfLife
// within the last 1000 nonces, at which point the wallet should be migrated.
export const EOL_NONCE_THRESHOLD = 2n ** 96n - 1000n
