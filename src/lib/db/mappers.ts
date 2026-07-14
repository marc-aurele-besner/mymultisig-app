import { MultiSigTransactionRequest } from '../../models/MultiSigs'

// Maps a PostgreSQL row (snake_case) to the client-side request shape.
export function rowToMultiSigRequest(row: Record<string, any>): MultiSigTransactionRequest {
  return {
    id: row.id,
    multiSigAddress: row.multi_sig_address,
    request: row.request,
    description: row.description,
    submitter: row.submitter,
    signatures: row.signatures ?? [],
    ownerSigners: row.owner_signers ?? [],
    dateSubmitted: row.date_submitted,
    dateExecuted: row.date_executed ?? '',
    isActive: row.is_active ?? true,
    isExecuted: row.is_executed ?? false,
    isCancelled: row.is_cancelled ?? false,
    isConfirmed: row.is_confirmed ?? false,
    isSuccessful: row.is_successful ?? false
  }
}
