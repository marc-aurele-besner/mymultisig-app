// Discord interaction response builders. Mirrors src/lib/slack/blockKit.ts
// with Slack's Block Kit shapes swapped for Discord's embeds + action rows.
// Each builder returns the shape the interactions endpoint serializes:
//   { type: 4, data: { content?, embeds?, components?, flags? } }
//
// Flags (https://discord.com/developers/docs/resources/channel#message-object-message-flags):
//   EPHEMERAL = 1 << 6 = 64 — only the invoking user sees the response.
//
// type values (https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-callback-type):
//   1 — Pong (used for the PING handshake)
//   4 — Channel message with source
//   5 — Deferred channel message (acknowledge; respond later via webhook)
//
// We only return type 4 from the slash command router; type 1 is handled
// inline in the interactions route, and the foundation has no async paths
// that would need type 5.
//
// newRequestEmbed (added with the notifier) renders a "new request"
// notification. Unlike the slash command replies, this shape is sent as
// a free-form channel message (POST /channels/{id}/messages), not as an
// interaction response. The dispatcher in src/lib/notifications/dispatcher.ts
// unpacks data.embeds / data.components and posts them via discordApi.

import type { NewRequestInput } from '../notifications/dispatcher'

const APP_URL = (): string => {
  // Public app URL. The settings page links here; the button targets on
  // the command responses use the same. Override via NEXT_PUBLIC_APP_URL.
  return process.env.NEXT_PUBLIC_APP_URL ?? 'https://mymultisig.app'
}

const EMBED_COLOR_PRIMARY = 0xf97316 // ember orange — matches the brand

const shortenAddress = (address: string): string => `${address.slice(0, 6)}…${address.slice(-4)}`

export interface DiscordEmbed {
  title?: string
  description?: string
  color?: number
  fields?: { name: string; value: string; inline?: boolean }[]
  footer?: { text: string }
}

export interface DiscordComponent {
  type: number // 2 = button
  style: number // 1 = primary, 2 = secondary, 5 = link
  label?: string
  url?: string
  custom_id?: string
}

export interface DiscordInteractionResponse {
  type: 4
  data: {
    content?: string
    embeds?: DiscordEmbed[]
    components?: { type: 1; components: DiscordComponent[] }[]
    flags?: number
  }
}

const PRIMARY_BRAND: Pick<DiscordEmbed, 'color'> = { color: EMBED_COLOR_PRIMARY }

const linkButton = (label: string, url: string): DiscordComponent => ({
  type: 2,
  style: 5,
  label,
  url
})

const actionRow = (components: DiscordComponent[]): { type: 1; components: DiscordComponent[] } => ({
  type: 1,
  components
})

export const balanceEmbed = (chainName: string, address: string, balanceEth: string): DiscordInteractionResponse => ({
  type: 4,
  data: {
    embeds: [
      {
        ...PRIMARY_BRAND,
        title: `Balance on ${chainName}`,
        description: `\`${balanceEth}\` ETH`,
        footer: { text: `Multisig ${address}` }
      }
    ],
    components: [actionRow([linkButton('Open in app', `${APP_URL()}/multisig/${address}`)])]
  }
})

export const addressBookEmbed = (
  chainName: string,
  address: string,
  labels: { label: string; kind: string; isPublic: boolean }[]
): DiscordInteractionResponse => {
  const description =
    labels.length === 0
      ? '_No labels in the public address book for this address._'
      : labels.map((l) => `• \`${l.label}\` _(${l.kind}${l.isPublic ? ', public' : ''})_`).join('\n')
  return {
    type: 4,
    data: {
      embeds: [
        {
          ...PRIMARY_BRAND,
          title: `Address book — ${chainName}`,
          description
        }
      ],
      components: [actionRow([linkButton('Open in app', `${APP_URL()}/multisig/${shortenAddress(address)}`)])]
    }
  }
}

export const comingSoonEmbed = (feature: string, actionUrl: string, actionLabel: string): DiscordInteractionResponse => ({
  type: 4,
  data: {
    embeds: [
      {
        ...PRIMARY_BRAND,
        title: `:hourglass_flowing_sand: ${feature}`,
        description: 'Coming in the next release. For now, use the app.'
      }
    ],
    components: [actionRow([linkButton(actionLabel, `${APP_URL()}${actionUrl}`,)])],
    flags: 64 // EPHEMERAL — only the requester sees it
  }
})

export const errorEmbed = (text: string): DiscordInteractionResponse => ({
  type: 4,
  data: {
    embeds: [
      {
        ...PRIMARY_BRAND,
        title: ':warning: Error',
        description: text
      }
    ],
    flags: 64 // EPHEMERAL
  }
})

export const helpEmbed = (): DiscordInteractionResponse => ({
  type: 4,
  data: {
    embeds: [
      {
        ...PRIMARY_BRAND,
        title: 'MyMultiSig slash commands',
        description:
          '• `/balance <chain> <multisig>` — show the native ETH (or chain equivalent) balance\n' +
          '• `/address-book <chain> <address>` — list the public labels for an address\n' +
          '• `/propose` — propose a new request (coming soon)\n' +
          '• `/sign <request_id>` — open a request to sign (coming soon)\n' +
          '• `/help` — show this message'
      }
    ],
    flags: 64 // EPHEMERAL
  }
})

// "New request" notification builder. Used by the dispatcher to post
// into every Discord channel bound to (multisigAddress, chainId). Mirrors
// the Slack Block Kit and Telegram HTML builders one-for-one.
//
// Note: the return type is still DiscordInteractionResponse (type 4
// shape), but the dispatcher unpacks `data.embeds` + `data.components`
// and posts them via discordApi('channels/{id}/messages'). The `type: 4`
// wrapper is harmless in that context — Discord's free-form message API
// accepts the same embed + component shapes.
export const newRequestEmbed = (input: NewRequestInput): DiscordInteractionResponse => {
  const chainName = input.chainName ?? 'unknown chain'
  const threshold = input.threshold ?? '?'
  const requestUrl = `${APP_URL()}/request/${input.request.id}`
  const explorerUrl = input.explorerUrl ? `${input.explorerUrl}/address/${input.request.multiSigAddress}` : null

  return {
    type: 4,
    data: {
      embeds: [
        {
          ...PRIMARY_BRAND,
          title: `:sparkles: New request on ${chainName}`,
          description: input.request.description,
          fields: [
            { name: 'Threshold', value: `${input.request.signatures.length}/${threshold} signatures`, inline: true },
            { name: 'Submitter', value: `\`${shortenAddress(input.request.submitter)}\``, inline: true }
          ],
          footer: { text: `Multisig ${input.request.multiSigAddress}` }
        }
      ],
      components: [
        actionRow([
          linkButton('View request', requestUrl),
          ...(explorerUrl != null ? [linkButton('View on explorer', explorerUrl)] : [])
        ])
      ]
    }
  }
}
