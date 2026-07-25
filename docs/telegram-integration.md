# Telegram integration

Foundation for a real Telegram bot that answers slash commands (`/balance`,
`/address-book`, `/propose`, `/sign`) in any chat where the bot is a member.
Telegram has no OAuth — the user creates the bot in `@BotFather`, pastes the
token on `/settings/telegram`, and the server registers a webhook with a
secret token, then stores both encrypted at rest.

The "post a notification when a new request is created" loop is the next PR.
This one only lands the install + command + webhook plumbing.

## Prerequisites

- A mymultisig-app deployment reachable from the public internet
  (Telegram requires `https://` for webhook URLs, with a public TLS cert).
- Neon `DATABASE_URL` already set. The schema is in
  `src/lib/db/schema.sql`; the new tables are additive.
- `SESSION_SECRET` (or its `PRIVATE_KEY` fallback) already set for SIWE
  cookies. The Telegram install/uninstall routes are session-gated.

## 1. Create the bot

1. Open Telegram and message `@BotFather`.
2. Send `/newbot`, pick a display name, pick a username (must end in
   `bot`). BotFather replies with a token shaped like
   `123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`. Copy it.
3. Optional: send `/setdescription` and `/setabouttext` to brand the bot
   in chats where it's a member.

You don't need to message `@BotFather` again to enable commands — the
server calls `setMyCommands` for you on every install.

## 2. Set the env vars

Append to your `.env.local` (or whatever your deployment reads):

```bash
TELEGRAM_TOKEN_ENCRYPTION_KEY=$(openssl rand -base64 32)
```

`TELEGRAM_TOKEN_ENCRYPTION_KEY` must decode to exactly 32 bytes. The
encryption key is used for both the bot token and the per-install
webhook secret. The webhook URL is built from the live request host;
no separate redirect-URI override is needed (unlike Slack/Discord OAuth).

Optional: `TELEGRAM_API_BASE_URL=https://api.telegram.org` (default).
Override this in tests against a mock server.

## 3. Run the database migration

The new tables are additive and idempotent. Apply the schema:

```bash
psql "$DATABASE_URL" -f src/lib/db/schema.sql
```

Three new tables are created: `telegram_installations`,
`telegram_user_links`, `telegram_chat_configs`. Existing tables are
untouched. The partial unique index
`idx_telegram_installations_active` enforces "at most one active
installation" — a second `setWebhook` would override the first anyway.

## 4. Register the bot in the app

1. `yarn dev` (or deploy the branch).
2. Sign in with your wallet.
3. Visit `/settings/telegram`, paste the bot token into the form, click
   **Install**.
4. The server:
   - Validates the token via `getMe`.
   - Generates a 32-char `A-Za-z0-9_-` webhook secret.
   - Calls `setWebhook(url, secret_token=secret, allowed_updates=[...])`.
   - Calls `setMyCommands` with the five slash commands.
   - Encrypts the bot token + secret and inserts the row with
     `is_active=true`. If a previous active row exists, it's flipped to
     `is_active=false` in the same transaction.
5. You'll see the bot appear in the list with `@username`, an
   **installed** badge, and an **Uninstall** button.

## 5. Add the bot to chats

The bot answers slash commands in any chat it's been added to. To add it
to a group, open the group, **Add Member**, search for `@your_bot`, pick
it. To DM it, open a chat with `@your_bot` and send `/start`.

In a chat with the bot, type `/help` to see the command list. The five
commands match the Discord and Slack versions:

- `/balance <chain> <multisig>` — native balance of an address.
- `/address-book <chain> <address>` — public labels for an address.
- `/propose` — stub; returns a "coming soon" message.
- `/sign <request_id>` — stub; same.
- `/help` — this list.

## 6. Verify

Smoke checks (no real bot required, just the env var set):

```bash
# 503 when env var is unset
unset TELEGRAM_TOKEN_ENCRYPTION_KEY
curl -i http://localhost:3000/api/telegram/installations

# 401 when the secret header is missing
curl -i -X POST http://localhost:3000/api/telegram/webhook -d '{}'

# 401 when the secret header is wrong
curl -i -X POST http://localhost:3000/api/telegram/webhook \
  -H 'X-Telegram-Bot-Api-Secret-Token: wrong' -d '{}'
```

All three return clean codes + JSON bodies, not 500s.

End-to-end with a real bot:

- After install, `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
  should show `url: https://<host>/api/telegram/webhook`,
  `has_custom_certificate: false`, `pending_update_count: 0`.
- In any chat with the bot, type `/help` and expect the HTML command
  list. Type `/balance mainnet 0xd8da6bf26964af9d7eed9e03e53415d37aa96045`
  for the vitalik.eth mainnet balance, with an inline "Open in app" button.
- Inspect the DB:
  ```sql
  SELECT id, bot_username, bot_id, is_active, installed_by_wallet
    FROM telegram_installations;
  -- telegram_user_links and telegram_chat_configs are stubs in this PR;
  -- populated by the next PR's binding + linking flows.
  ```

## 7. Uninstall

Visit `/settings/telegram`, click **Uninstall**. The server calls
`deleteWebhook` (best-effort), then deletes the bot's three `telegram_*`
rows. After uninstall, `getWebhookInfo` shows `url: ''` and the bot
stops responding.

## Known limits

- **One active bot per deployment.** Telegram's webhook URL is global
  per bot, and the secret-token header doesn't carry an installation id,
  so we can only verify deliveries against one secret at a time.
  Registering a new bot auto-disables the previous one (the new
  `setWebhook` overrides the first anyway). A future PR can support
  per-install URLs (`/api/telegram/webhook/<installation_id>`) so this
  limit goes away.
- **`installed_by_wallet` is nullable.** An install from a non-SIWE
  browser still succeeds; the row is just absent from any wallet's
  `/api/telegram/installations` list. A "claim this install" flow is
  the next PR.
- **Slash commands are read-only.** `/propose` and `/sign` return
  "coming soon" messages with a button to the app page.
- **No per-chat binding UI yet.** `telegram_chat_configs` is in place
  so the next PR (new-request notifications) doesn't need a migration,
  but the settings page doesn't expose bindings yet.
- **No user→wallet linking yet.** `telegram_user_links` is in place;
  the next PR links a Telegram user id to a wallet via a SIWE-style
  challenge inside Telegram.

## Troubleshooting

**`401 Invalid webhook secret` on every update.** The verifier uses
`timingSafeEqual` on equal-length Buffers. The most common cause is a
stale DB row (e.g., you re-ran the install flow but the old bot's
webhook URL still points here). `getWebhookInfo` will show two
webhook URLs in that case — the server only knows about one. Re-install
or manually `deleteWebhook` on the stray bot.

**`503 Telegram bot is not configured on this deployment`.** The
`telegramConfig()` helper threw at module load. The most common cause
is `TELEGRAM_TOKEN_ENCRYPTION_KEY` not being a 32-byte base64 string.
Check `openssl rand -base64 32 | wc -c` (should print 45 including the
trailing newline — the base64 itself is 44 chars).

**`getMe failed: Unauthorized`** on install. The token is wrong or
already revoked. Re-issue one via `@BotFather` → `/revoke` then
`/token`.

**`setWebhook failed`** on install. Most often the webhook URL isn't
publicly reachable over HTTPS. Telegram rejects `http://` URLs and
self-signed certs unless you opt into `self-signed` mode via
`setWebhook`'s `certificate` field (not implemented here — the
foundation assumes a normal CA-signed cert).
