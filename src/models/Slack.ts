// Client-facing types for the Slack integration. The bot token is never
// exposed to React — the workspace mapper drops it and replaces it with
// `hasToken: true` so the settings page can show "Installed" without ever
// seeing ciphertext.

export type SlackWorkspace = {
  teamId: string
  teamName: string
  hasToken: boolean
  botUserId: string
  scope: string
  installedByWallet: string | null
  installedAt: string | null
  updatedAt: string | null
}

export type SlackUserLink = {
  id: string
  teamId: string
  slackUserId: string
  walletAddress: string | null
  createdAt: string | null
  updatedAt: string | null
}

export type SlackChannelConfig = {
  id: string
  teamId: string
  channelId: string
  channelName: string | null
  multisigAddress: `0x${string}`
  chainId: number
  createdBy: string
  createdAt: string | null
}
