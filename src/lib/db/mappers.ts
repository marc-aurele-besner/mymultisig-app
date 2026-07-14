import { MultiSig, MultiSigTransactionRequest } from '../../models/MultiSigs'

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

// Maps a multisig_wallets row (snake_case) to the client-side wallet shape.
export function rowToMultiSig(row: Record<string, any>): MultiSig {
  return {
    chainId: Number(row.chain_id),
    chainName: row.chain_name,
    factoryAddress: row.factory_address,
    id: Number(row.contract_id),
    name: row.name,
    version: row.version,
    address: row.address,
    threshold: Number(row.threshold),
    ownerCount: Number(row.owner_count),
    nonce: Number(row.nonce ?? 0),
    owners: row.owners ?? [],
    isDeployed: row.is_deployed ?? true,
    walletType: row.wallet_type === 'extended' ? 'extended' : 'simple',
    allowOnlyOwnerRequest: row.allow_only_owner_request ?? false
  }
}
