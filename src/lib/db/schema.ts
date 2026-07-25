import { boolean, integer, jsonb, pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// Drizzle table definitions for the mymultisig Neon database. Column names
// stay snake_case to match the production schema in src/lib/db/schema.sql
// (the .sql is the migration source of truth — drizzle just gives us typed
// queries). TS property names are camelCase so the query results line up
// with the shapes in src/models/MultiSigs.ts without a hand-written mapper.
//
// JSONB columns get a $type<T> hint so callers see a useful type rather
// than `unknown`.

export const multisigRequests = pgTable('multisig_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  multiSigAddress: text('multi_sig_address').notNull(),
  request: jsonb('request').$type<Record<string, unknown>>().notNull(),
  description: text('description').notNull(),
  submitter: text('submitter').notNull(),
  signatures: jsonb('signatures').$type<string[]>().notNull().default([]),
  ownerSigners: jsonb('owner_signers').$type<string[]>().notNull().default([]),
  dateSubmitted: text('date_submitted').notNull(),
  dateExecuted: text('date_executed').notNull().default(''),
  isActive: boolean('is_active').notNull().default(true),
  isExecuted: boolean('is_executed').notNull().default(false),
  isCancelled: boolean('is_cancelled').notNull().default(false),
  isConfirmed: boolean('is_confirmed').notNull().default(false),
  isSuccessful: boolean('is_successful').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
})

export const multisigWallets = pgTable('multisig_wallets', {
  id: serial('id').primaryKey(),
  chainId: integer('chain_id').notNull(),
  chainName: text('chain_name').notNull(),
  factoryAddress: text('factory_address').notNull(),
  contractId: integer('contract_id').notNull(),
  name: text('name').notNull(),
  version: text('version').notNull(),
  address: text('address').notNull(),
  threshold: integer('threshold').notNull(),
  ownerCount: integer('owner_count').notNull(),
  nonce: integer('nonce').notNull().default(0),
  owners: jsonb('owners').$type<string[]>().notNull().default([]),
  isDeployed: boolean('is_deployed').default(true),
  walletType: text('wallet_type').notNull().default('simple'),
  allowOnlyOwnerRequest: boolean('allow_only_owner_request').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
})

export const addressBook = pgTable('address_book', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerAddress: text('owner_address').notNull(),
  chainId: integer('chain_id').notNull(),
  address: text('address').notNull(),
  label: text('label').notNull(),
  kind: text('kind').notNull().default('wallet'),
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
})

export const savedContracts = pgTable('saved_contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerAddress: text('owner_address').notNull(),
  chainId: integer('chain_id').notNull(),
  chainName: text('chain_name').notNull().default(''),
  address: text('address').notNull(),
  name: text('name').notNull(),
  abi: jsonb('abi').$type<unknown[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
})

export const factories = pgTable('factories', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerAddress: text('owner_address').notNull(),
  chainId: integer('chain_id').notNull(),
  chainName: text('chain_name').notNull().default(''),
  address: text('address').notNull(),
  name: text('name').notNull(),
  version: text('version').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
})

// Slack app installation. See src/lib/db/schema.sql for the column-level
// rationale. The bot token is encrypted at rest; the mapper drops it from
// the client-facing type and exposes a `hasToken` boolean instead so the
// React layer never sees ciphertext.
export const slackWorkspaces = pgTable('slack_workspaces', {
  teamId: text('team_id').primaryKey(),
  teamName: text('team_name').notNull(),
  botTokenEncrypted: text('bot_token_encrypted').notNull(),
  botUserId: text('bot_user_id').notNull(),
  scope: text('scope').notNull(),
  // Nullable: an install from a non-SIWE browser is allowed; the row is
  // simply absent from any wallet's /api/slack/workspaces list.
  installedByWallet: text('installed_by_wallet'),
  installedAt: timestamp('installed_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
})

export const slackUserLinks = pgTable('slack_user_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: text('team_id').notNull(),
  slackUserId: text('slack_user_id').notNull(),
  walletAddress: text('wallet_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
})

export const slackChannelConfigs = pgTable('slack_channel_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: text('team_id').notNull(),
  channelId: text('channel_id').notNull(),
  channelName: text('channel_name'),
  multisigAddress: text('multisig_address').notNull(),
  chainId: integer('chain_id').notNull(),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
})

// Discord app installation. See src/lib/db/schema.sql for the column-level
// rationale. The bot token is encrypted at rest; the mapper drops it from
// the client-facing type and exposes a `hasToken` boolean instead so the
// React layer never sees ciphertext. Mirrors slackWorkspaces with
// team_id → guild_id.
export const discordWorkspaces = pgTable('discord_workspaces', {
  guildId: text('guild_id').primaryKey(),
  guildName: text('guild_name').notNull(),
  botTokenEncrypted: text('bot_token_encrypted').notNull(),
  applicationId: text('application_id').notNull(),
  scope: text('scope').notNull(),
  // Nullable: an install from a non-SIWE browser is allowed; the row is
  // simply absent from any wallet's /api/discord/workspaces list.
  installedByWallet: text('installed_by_wallet'),
  installedAt: timestamp('installed_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
})

export const discordUserLinks = pgTable('discord_user_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  guildId: text('guild_id').notNull(),
  discordUserId: text('discord_user_id').notNull(),
  walletAddress: text('wallet_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
})

export const discordChannelConfigs = pgTable('discord_channel_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  guildId: text('guild_id').notNull(),
  channelId: text('channel_id').notNull(),
  channelName: text('channel_name'),
  multisigAddress: text('multisig_address').notNull(),
  chainId: integer('chain_id').notNull(),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
})

export type MultisigRequestRow = typeof multisigRequests.$inferSelect
export type MultisigRequestInsert = typeof multisigRequests.$inferInsert
export type MultisigWalletRow = typeof multisigWallets.$inferSelect
export type MultisigWalletInsert = typeof multisigWallets.$inferInsert
export type AddressBookRow = typeof addressBook.$inferSelect
export type AddressBookInsert = typeof addressBook.$inferInsert
export type SavedContractRow = typeof savedContracts.$inferSelect
export type SavedContractInsert = typeof savedContracts.$inferInsert
export type FactoryRow = typeof factories.$inferSelect
export type FactoryInsert = typeof factories.$inferInsert
export type SlackWorkspaceRow = typeof slackWorkspaces.$inferSelect
export type SlackWorkspaceInsert = typeof slackWorkspaces.$inferInsert
export type SlackUserLinkRow = typeof slackUserLinks.$inferSelect
export type SlackUserLinkInsert = typeof slackUserLinks.$inferInsert
export type SlackChannelConfigRow = typeof slackChannelConfigs.$inferSelect
export type SlackChannelConfigInsert = typeof slackChannelConfigs.$inferInsert
export type DiscordWorkspaceRow = typeof discordWorkspaces.$inferSelect
export type DiscordWorkspaceInsert = typeof discordWorkspaces.$inferInsert
export type DiscordUserLinkRow = typeof discordUserLinks.$inferSelect
export type DiscordUserLinkInsert = typeof discordUserLinks.$inferInsert
export type DiscordChannelConfigRow = typeof discordChannelConfigs.$inferSelect
export type DiscordChannelConfigInsert = typeof discordChannelConfigs.$inferInsert
