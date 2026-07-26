# Cross-cutting new-request notifications

When a new multisig request is created on the server, this feature fans
out a notification message to every Slack channel, Discord channel, and
Telegram chat bound to that multisig (on the right chain). The same
five slash commands from each foundation PR continue to work; the new
pieces are `/bind`, `/unbind`, and the server-side dispatcher that
posts on every new request.

The trigger is inside `POST /api/multisig-requests` (after the row is
inserted) and runs fire-and-forget — one platform's failure never
blocks the others or the original request-create endpoint.

## How a notification fires

```
useSignedMultiSigRequest  ──┐
                            ├─► addMultiSigRequest ─► POST /api/multisig-requests
useUserOpSigning           ──┘                                    │
                                                                     ▼
                                                            db.insert(multisig_requests)
                                                                     │
                                                                     ▼
                                              void notifyNewRequest({ request, chainId, … })
                                                                     │
                              ┌──────────────────────┬──────────────┴────────────────┐
                              ▼                      ▼                               ▼
                   slackApi('chat.postMessage')  discordApi('channels/{id}/…')  telegramApi('sendMessage')
                              │                      │                               │
                              ▼                      ▼                               ▼
                  #treasury in Slack            #treasury in Discord            @MyBot in Telegram
```

Each platform's send is awaited inside `Promise.allSettled`. A bot
uninstalled between bind and notify gets logged and skipped; the
other two platforms still post.

## The `/bind` slash command

Run it in any chat where the bot is present:

```
/bind mainnet 0xd8da6bf26964af9d7eed9e03e53415d37aa96045
/bind 1 0xd8da6bf26964af9d7eed9e03e53415d37aa96045
```

The bot replies (ephemeral on Slack/Discord, regular on Telegram):

```
✅ Bound 0xd8da…6045 on Mainnet. Anyone in this chat can now receive
   new-request notifications.
```

If the binding already exists, the same success message is returned
(unique-index conflict is treated as a no-op).

### `/bind` and `/unbind` semantics

- **No wallet ownership check in the MVP.** The slash-command payload
  doesn't carry a wallet address. Verifying the binding wallet owns
  the multisig would need a SIWE-style challenge in chat, or a side
  channel between the chat client and the browser — both are
  non-trivial and out of scope for this PR. A follow-up PR will add
  SIWE-in-chat via the existing `*_user_links` tables.
- **Anyone in the chat can `/bind` or `/unbind`.** This matches the
  "anyone in the room is allowed to configure the room" mental
  model. The settings-page path is the wallet-gated counterpart for
  pre-binding before the bot is in the channel.
- **Audit trail**: `created_by` is set to `platform:<user_id>` for
  slash-command bindings and `settings:<wallet>` for settings-page
  bindings. Neither is a wallet address — they're opaque identifiers.

## Settings-page binding

Each settings page (`/settings/slack`, `/settings/discord`,
`/settings/telegram`) shows a Channel bindings card underneath the
workspaces/installations list. Each row has an Unbind button that
DELETEs the binding. These routes require SIWE session and verify
the wallet matches the parent workspace's `installed_by_wallet`:

- `GET /api/{slack,discord}/channel-bindings` and
  `GET /api/telegram/chat-bindings` — list bindings for the verified
  wallet.
- `DELETE /api/{slack,discord}/channel-bindings/[bindingId]` and
  `DELETE /api/telegram/chat-bindings/[bindingId]` — remove a
  binding.

The Discord and Telegram UI also accept pre-binding via
`POST /api/{discord,telegram}/{channel,chat}-bindings` (used by the
slash-command path implicitly; the settings page calls it from the
form).

## What the notification looks like

Same logical content across the three platforms:

- **Title**: `🆕 New request on <chain>`
- **Description**: the request description verbatim
- **Threshold**: `N/M signatures` (N = current signatures, M =
  wallet threshold)
- **Submitter**: `0xabc…1234` short form
- **Multisig**: full address
- **Buttons**: `View request` (→ `/request/<id>`) and `View on
  explorer` (→ `<explorer>/address/<multisig>` when the chain has a
  configured explorer)

Slack uses Block Kit (section + section + context + actions).
Discord uses embeds + action row. Telegram uses HTML + inline_keyboard.

## Known limits

- **Notifications read `0/N` for the threshold on the first
  delivery.** The notification fires when the request is first
  persisted, so the submitter's signature is the only one in. A
  follow-up PR will fire a "threshold-reached" notification from the
  on-chain `MultiRequestExecuted` event watcher in
  `useExecTransaction.ts`.
- **No ownership check on `/bind`.** Documented above. SIWE-in-chat
  is the follow-up.
- **One active Telegram bot per deployment.** Telegram's webhook URL
  is global per bot, and the secret-token header doesn't carry an
  installation id, so the dispatcher's Telegram branch can only verify
  deliveries against one secret at a time. Registering a new bot
  auto-disables the previous one (the new `setWebhook` overrides the
  first anyway).

## Smoke checks

```bash
# 1. Bind a channel via the API (settings-page path)
curl -X POST http://localhost:3000/api/slack/channel-bindings \
  -H "Content-Type: application/json" -b "siwe-session=<cookie>" \
  -d '{"teamId":"T123","channelId":"C123","channelName":"#treasury",
       "multisigAddress":"0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
       "chainId":1}'

# 2. Create a request — fires the dispatcher
curl -X POST http://localhost:3000/api/multisig-requests \
  -H "Content-Type: application/json" -b "siwe-session=<cookie>" \
  -d '{
    "multiSigAddress":"0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    "submitter":"0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    "description":"Send 1 ETH to treasury",
    "request":{"to":"0xvictim","value":"1000000000000000000","data":"0x","operation":0},
    "signatures":[],"ownerSigners":[],
    "dateSubmitted":"2026-07-26T00:00:00Z","dateExecuted":""
  }'

# 3. Confirm the message lands in the bound channel (manual — UI)
```

Expected: 200 from step 2, the bound channel receives the message
within ~1s.

```bash
# In Slack/Discord/Telegram
/bind mainnet 0xd8da6bf26964af9d7eed9e03e53415d37aa96045
/unbind mainnet 0xd8da6bf26964af9d7eed9e03e53415d37aa96045
```

Expected: ephemeral (Slack/Discord) or regular (Telegram) confirmation;
`/unbind` removes the binding row.

## Troubleshooting

- **`notifyNewRequest: chainId missing; skipping fan-out`** in the
  server log: the request's `multiSigAddress` has no matching
  `multisig_wallets` row. Either the wallet hasn't been indexed yet
  (re-index from the app) or the row was deleted.
- **`notifyNewRequest: channel post N failed`** in the server log:
  one platform's send threw. The other platforms still post. The most
  common cause is a bot uninstalled between bind and notify.
- **`SlackApiError` / `DiscordApiError` / `TelegramApiError`** with
  `401 / 403 / 404`: bot token expired or bot removed from the
  channel. Reinstall the bot from `/settings/<platform>`.
- **No message lands in Telegram**: check
  `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`. If the URL is
  blank, the bot was uninstalled; the row is still in
  `telegram_installations` (the dispatcher will skip it because
  `is_active=false` doesn't gate the lookup, but the bot token will
  fail to decrypt or `sendMessage` will 404). Reinstall.