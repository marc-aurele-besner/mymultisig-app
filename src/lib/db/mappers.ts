import { MultiSig, MultiSigExecTransactionArgs, MultiSigTransactionRequest } from '../../models/MultiSigs'
import { DiscordChannelConfig, DiscordUserLink, DiscordWorkspace } from '../../models/Discord'
import { SlackChannelConfig, SlackUserLink, SlackWorkspace } from '../../models/Slack'

import type {
  DiscordChannelConfigRow,
  DiscordUserLinkRow,
  DiscordWorkspaceRow,
  MultisigRequestRow,
  MultisigWalletRow,
  SlackChannelConfigRow,
  SlackUserLinkRow,
  SlackWorkspaceRow
} from './schema'

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

// Slack mappers: drop server-only fields (the encrypted token) from the
// client-facing shape so React never sees ciphertext.
export function rowToSlackWorkspace(row: SlackWorkspaceRow): SlackWorkspace {
  return {
    teamId: row.teamId,
    teamName: row.teamName,
    hasToken: row.botTokenEncrypted.length > 0,
    botUserId: row.botUserId,
    scope: row.scope,
    installedByWallet: row.installedByWallet,
    installedAt: row.installedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt?.toISOString() ?? null
  }
}

export function rowToSlackUserLink(row: SlackUserLinkRow): SlackUserLink {
  return {
    id: row.id,
    teamId: row.teamId,
    slackUserId: row.slackUserId,
    walletAddress: row.walletAddress,
    createdAt: row.createdAt?.toISOString() ?? null,
    updatedAt: row.updatedAt?.toISOString() ?? null
  }
}

export function rowToSlackChannelConfig(row: SlackChannelConfigRow): SlackChannelConfig {
  return {
    id: row.id,
    teamId: row.teamId,
    channelId: row.channelId,
    channelName: row.channelName,
    multisigAddress: row.multisigAddress as `0x${string}`,
    chainId: row.chainId,
    createdBy: row.createdBy,
    createdAt: row.createdAt?.toISOString() ?? null
  }
}

// Discord mappers: drop server-only fields (the encrypted token) from the
// client-facing shape so React never sees ciphertext. Mirrors the Slack
// mappers with team_id → guild_id.
export function rowToDiscordWorkspace(row: DiscordWorkspaceRow): DiscordWorkspace {
  return {
    guildId: row.guildId,
    guildName: row.guildName,
    hasToken: row.botTokenEncrypted.length > 0,
    applicationId: row.applicationId,
    scope: row.scope,
    installedByWallet: row.installedByWallet,
    installedAt: row.installedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt?.toISOString() ?? null
  }
}

export function rowToDiscordUserLink(row: DiscordUserLinkRow): DiscordUserLink {
  return {
    id: row.id,
    guildId: row.guildId,
    discordUserId: row.discordUserId,
    walletAddress: row.walletAddress,
    createdAt: row.createdAt?.toISOString() ?? null,
    updatedAt: row.updatedAt?.toISOString() ?? null
  }
}

export function rowToDiscordChannelConfig(row: DiscordChannelConfigRow): DiscordChannelConfig {
  return {
    id: row.id,
    guildId: row.guildId,
    channelId: row.channelId,
    channelName: row.channelName,
    multisigAddress: row.multisigAddress as `0x${string}`,
    chainId: row.chainId,
    createdBy: row.createdBy,
    createdAt: row.createdAt?.toISOString() ?? null
  }
}
