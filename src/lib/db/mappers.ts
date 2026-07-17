import { MultiSig, MultiSigExecTransactionArgs, MultiSigTransactionRequest } from '../../models/MultiSigs'

import type { MultisigRequestRow, MultisigWalletRow } from './schema'

// Narrow a drizzle row to the camelCase model the client already speaks.
// Drizzle returns camelCase directly (column names in schema.ts map SQL →
// TS), so these are essentially identity functions that drop server-only
// fields (e.g. createdAt) and tighten JSONB shapes to the model types.

export function rowToMultiSigRequest(row: MultisigRequestRow): MultiSigTransactionRequest {
  return {
    id: row.id,
    multiSigAddress: row.multiSigAddress as `0x${string}`,
    request: row.request as unknown as MultiSigExecTransactionArgs,
    description: row.description,
    submitter: row.submitter as `0x${string}`,
    signatures: row.signatures,
    ownerSigners: row.ownerSigners as `0x${string}`[],
    dateSubmitted: row.dateSubmitted,
    dateExecuted: row.dateExecuted,
    isActive: row.isActive,
    isExecuted: row.isExecuted,
    isCancelled: row.isCancelled,
    isConfirmed: row.isConfirmed,
    isSuccessful: row.isSuccessful
  }
}

export function rowToMultiSig(row: MultisigWalletRow): MultiSig {
  return {
    chainId: row.chainId,
    chainName: row.chainName,
    factoryAddress: row.factoryAddress as `0x${string}`,
    id: row.contractId,
    name: row.name,
    version: row.version,
    address: row.address as `0x${string}`,
    threshold: row.threshold,
    ownerCount: row.ownerCount,
    nonce: row.nonce,
    owners: row.owners,
    isDeployed: row.isDeployed ?? true,
    walletType: row.walletType === 'extended' || row.walletType === 'advanced' ? row.walletType : 'simple',
    allowOnlyOwnerRequest: row.allowOnlyOwnerRequest
  }
}
