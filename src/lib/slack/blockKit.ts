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

// Escape the three characters Slack treats as control sequences in mrkdwn
// (https://api.slack.com/reference/surfaces/formatting#escaping). Request
// descriptions are free text from whoever submitted the request, so without
// this a description containing `<!channel>` would ping the whole channel.
export const escapeMrkdwn = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

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
        { type: 'mrkdwn', text: `<${APP_URL()}/multisig/${address}|Open in app →>` }
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

// Reply for /propose and /sign. Proposing and signing need the user's own
// wallet, so the bot never does either; it hands the user a deep link into
// the app instead.
export const openInAppMessage = (text: string, actionUrl: string, actionLabel: string): SlackSlashResponse => ({
  response_type: 'ephemeral',
  text,
  blocks: [
    {
      type: 'section',
      text: { type: 'mrkdwn', text }
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
          '• `/bind <chain> <multisig>` — post new-request and ready-to-execute notifications for a multisig in this channel\n' +
          '• `/unbind <chain> <multisig>` — stop posting them here\n' +
          '• `/balance <chain> <address>` — show the native balance of an address\n' +
          '• `/address-book <chain> <address>` — list the public labels for an address\n' +
          '• `/propose` — open the app to propose a request\n' +
          '• `/sign <request_id>` — open a request in the app to sign it\n' +
          'Every command also works as `/multisig <command> …`, e.g. `/multisig bind sepolia 0xabc…`.\n' +
          '`<chain>` is a name (`mainnet`, `sepolia`, `polygon`, …) or a chain id (`1`, `11155111`, …).'
      }
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: 'Private channel? Run `/invite @MyMultiSig` first so the bot can post there.'
        }
      ]
    }
  ]
})

// Message the bot posts into the channel right after a successful /bind.
// Posting it doubles as a delivery check: if the bot cannot write to the
// channel (private channel it was not invited to, DM, archived channel),
// chat.postMessage fails and the router rolls the binding back.
export const bindAnnouncementMessage = (
  chainName: string,
  address: string,
  userId: string
): { text: string; blocks: any[] } => ({
  text: `This channel will now get MyMultiSig notifications for ${shortenAddress(address)} on ${chainName}.`,
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:bell: <@${userId}> connected this channel to multisig \`${address}\` on *${chainName}*. New requests and requests that are ready to execute will be posted here.`
      }
    },
    {
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: `<${APP_URL()}/multisig/${address}|Open the multisig in MyMultiSig →>` },
        { type: 'mrkdwn', text: 'Run `/unbind` with the same arguments to stop.' }
      ]
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
export const newRequestMessage = (input: NewRequestInput): SlackSlashResponse =>
  requestNotification(input, { emoji: ':sparkles:', heading: 'New request', buttonLabel: 'View request' })

// "Ready to execute" notification: fired once, on the signature that brings
// a request up to the wallet threshold (or on creation when the submitter's
// signature alone is enough). Same layout as newRequestMessage so the two
// read as a pair in the channel.
export const readyToExecuteMessage = (input: NewRequestInput): SlackSlashResponse =>
  requestNotification(input, {
    emoji: ':white_check_mark:',
    heading: 'Ready to execute',
    buttonLabel: 'Execute request'
  })

const requestNotification = (
  input: NewRequestInput,
  copy: { emoji: string; heading: string; buttonLabel: string }
): SlackSlashResponse => {
  const chainName = input.chainName ?? 'unknown chain'
  const threshold = input.threshold ?? '?'
  const description = escapeMrkdwn(input.request.description)
  const requestUrl = `${APP_URL()}/request/${input.request.id}`
  const explorerUrl = input.explorerUrl ? `${input.explorerUrl}/address/${input.request.multiSigAddress}` : null

  return {
    response_type: 'in_channel',
    text: `${copy.heading} on ${chainName} — ${description}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${copy.emoji} *${copy.heading} on ${chainName}*\n${description}`
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
            text: { type: 'plain_text', text: copy.buttonLabel },
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
