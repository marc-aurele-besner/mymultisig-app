// Small Block Kit message builders for the four slash commands. Each
// builder returns the shape Slack expects:
//   { response_type, text, blocks }
//
// response_type is 'in_channel' for read-only commands (the result is
// useful to anyone watching the channel) and 'ephemeral' for stubs that
// only the requester should see (e.g. 'coming soon' responses).
//
// newRequestMessage (added with the notifier) renders a "new request"
// notification — a different message shape from the slash command
// replies. Used by src/lib/notifications/dispatcher.ts to fan out
// cross-cutting notifications.

import type { NewRequestInput } from '../notifications/dispatcher'

export interface SlackSlashResponse {
  response_type: 'in_channel' | 'ephemeral'
  text: string

  blocks: any[]
}

const APP_URL = (): string => {
  // Public app URL. The settings page links here; the button targets on the
  // command responses use the same. Override via NEXT_PUBLIC_APP_URL.
  return process.env.NEXT_PUBLIC_APP_URL ?? 'https://mymultisig.app'
}

const shortenAddress = (address: string): string => `${address.slice(0, 6)}…${address.slice(-4)}`

export const balanceMessage = (chainName: string, address: string, balanceEth: string): SlackSlashResponse => ({
  response_type: 'in_channel',
  text: `${chainName} ${shortenAddress(address)} — ${balanceEth} ETH`,
  blocks: [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Balance on ${chainName}*\n\`${balanceEth}\` ETH` }
    },
    {
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: `Multisig \`${address}\`` },
        { type: 'mrkdwn', text: `<${APP_URL()}/multisig/${address}|Open in app →` }
      ]
    }
  ]
})

export const addressBookMessage = (
  chainName: string,
  address: string,
  labels: { label: string; kind: string; isPublic: boolean }[]
): SlackSlashResponse => {
  const labelLines =
    labels.length === 0
      ? '_No labels in the public address book for this address._'
      : labels.map((l) => `• \`${l.label}\` _(${l.kind}${l.isPublic ? ', public' : ''})_`).join('\n')
  return {
    response_type: 'in_channel',
    text: `${labels.length} label(s) for ${shortenAddress(address)} on ${chainName}`,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Address book — ${chainName}*\n${labelLines}` }
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `Address \`${address}\`` }]
      }
    ]
  }
}

export const comingSoonMessage = (feature: string, actionUrl: string, actionLabel: string): SlackSlashResponse => ({
  response_type: 'ephemeral',
  text: `${feature} is coming soon — use the app for now.`,
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:hourglass_flowing_sand: *${feature}* is coming in the next release. For now, use the app.`
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: actionLabel },
          url: `${APP_URL()}${actionUrl}`,
          style: 'primary'
        }
      ]
    }
  ]
})

export const errorMessage = (text: string): SlackSlashResponse => ({
  response_type: 'ephemeral',
  text,
  blocks: [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `:warning: ${text}` }
    }
  ]
})

// Confirmation message for the /bind slash command. Ephemeral so only
// the inviter sees the success/failure (no need to clutter the channel).
// Mirrors the Discord bindSuccessEmbed and Telegram bindSuccessPayload
// in shape — chain name + multisig short form.
export const bindSuccessMessage = (chainName: string, address: string): SlackSlashResponse => ({
  response_type: 'ephemeral',
  text: `Bound ${shortenAddress(address)} on ${chainName}`,
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:white_check_mark: Bound \`${shortenAddress(address)}\` on *${chainName}*. Anyone in this channel can now receive new-request notifications.`
      }
    }
  ]
})

// Confirmation for /unbind. Same shape as bindSuccessMessage.
export const bindRemovedMessage = (chainName: string, address: string): SlackSlashResponse => ({
  response_type: 'ephemeral',
  text: `Unbound ${shortenAddress(address)} on ${chainName}`,
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:wastebasket: Unbound \`${shortenAddress(address)}\` on *${chainName}*. This channel will no longer receive new-request notifications.`
      }
    }
  ]
})

export const helpMessage = (): SlackSlashResponse => ({
  response_type: 'ephemeral',
  text: 'MyMultiSig slash commands',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          '*MyMultiSig slash commands*\n' +
          '• `/balance <chain> <multisig>` — show the native ETH (or chain equivalent) balance\n' +
          '• `/address-book <chain> <address>` — list the public labels for an address\n' +
          '• `/bind <chain> <multisig>` — bind this channel to a multisig for new-request notifications\n' +
          '• `/unbind <chain> <multisig>` — remove a binding\n' +
          '• `/propose` — propose a new request (coming soon)\n' +
          '• `/sign <request_id>` — open a request to sign (coming soon)'
      }
    }
  ]
})

// "New request" notification builder. Used by the dispatcher to post into
// every Slack channel bound to (multisigAddress, chainId). Renders the
// same logical content as the Discord and Telegram equivalents, but in
// Block Kit (section + section + context + actions).
//
// The slack message is in_channel so the whole channel sees the request
// (matching how /balance posts its result for the whole room). The
// `text` field is the fallback for clients that don't render blocks.
export const newRequestMessage = (input: NewRequestInput): SlackSlashResponse => {
  const chainName = input.chainName ?? 'unknown chain'
  const threshold = input.threshold ?? '?'
  const description = input.request.description
  const requestUrl = `${APP_URL()}/request/${input.request.id}`
  const explorerUrl = input.explorerUrl ? `${input.explorerUrl}/address/${input.request.multiSigAddress}` : null

  return {
    response_type: 'in_channel',
    text: `New request on ${chainName} — ${description}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:sparkles: *New request on ${chainName}*\n${description}`
        }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Threshold*\n${input.request.signatures.length}/${threshold} signatures` },
          { type: 'mrkdwn', text: `*Submitter*\n\`${shortenAddress(input.request.submitter)}\`` }
        ]
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `Multisig \`${input.request.multiSigAddress}\`` }]
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View request' },
            url: requestUrl,
            style: 'primary'
          },
          ...(explorerUrl != null
            ? [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: 'View on explorer' },
                  url: explorerUrl
                }
              ]
            : [])
        ]
      }
    ]
  }
}
