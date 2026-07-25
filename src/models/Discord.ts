// Client-facing types for the Discord integration. The bot token is never
// exposed to React — the workspace mapper drops it and replaces it with
// `hasToken: true` so the settings page can show "Installed" without ever
// seeing ciphertext. Mirrors src/models/Slack.ts with team_id → guild_id.

export type DiscordWorkspace = {
  guildId: string
  guildName: string
  hasToken: boolean
  applicationId: string
  scope: string
  installedByWallet: string | null
  installedAt: string | null
  updatedAt: string | null
}

export type DiscordUserLink = {
  id: string
  guildId: string
  discordUserId: string
  walletAddress: string | null
  createdAt: string | null
  updatedAt: string | null
}

export type DiscordChannelConfig = {
  id: string
  guildId: string
  channelId: string
  channelName: string | null
  multisigAddress: `0x${string}`
  chainId: number
  createdBy: string
  createdAt: string | null
}
