// Client-facing types for the Telegram integration. The bot token and
// the webhook secret are never exposed to React — the installation
// mapper drops both and replaces them with `hasToken: true` so the
// settings page can show "Installed" without ever seeing ciphertext.
// Mirrors src/models/Discord.ts with guild_id → id and the added
// is_active + botId fields.

export type TelegramInstallation = {
  id: string
  botUsername: string
  botId: number
  hasToken: boolean
  installedByWallet: string | null
  isActive: boolean
  installedAt: string | null
  updatedAt: string | null
}

export type TelegramUserLink = {
  id: string
  installationId: string
  telegramUserId: number
  chatId: number | null
  walletAddress: string | null
  createdAt: string | null
  updatedAt: string | null
}

export type TelegramChatConfig = {
  id: string
  installationId: string
  chatId: number
  chatTitle: string | null
  multisigAddress: `0x${string}`
  chainId: number
  createdBy: string
  createdAt: string | null
}
