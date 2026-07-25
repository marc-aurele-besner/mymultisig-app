# Discord integration

Foundation for a real Discord application that can be installed into a
server, answers slash commands (`/balance`, `/address-book`, `/propose`,
`/sign`), and verifies every interaction with Ed25519 signatures. The
"post a notification when a new request is created" loop is the next PR
— this one only lands the install + command + interactions plumbing.

The application registers a bot user, stores the bot token encrypted in
Neon (`discord_workspaces`), and signs/verifies every inbound
interaction against the application's Ed25519 public key.

## Prerequisites

- A Discord server you control (use a test server; installs are
  server-wide).
- A mymultisig-app deployment reachable from the public internet
  (Discord's interaction endpoint must be https).
- Neon `DATABASE_URL` already set (the schema is in
  `src/lib/db/schema.sql`; the new tables are additive).
- `SESSION_SECRET` (or its `PRIVATE_KEY` fallback) already set for SIWE
  cookies. The Discord OAuth state cookie uses the same secret.

## 1. Create the Discord application

1. Go to <https://discord.com/developers/applications>, click
   **New Application**, name it **MyMultiSig**, accept the ToS.
2. On the **General Information** page, copy the **Application ID** —
   this is `DISCORD_CLIENT_ID`.
3. On the same page, copy the **Public Key** (Ed25519, 32 bytes hex) —
   this is `DISCORD_PUBLIC_KEY`.
4. On the **Bot** page, click **Reset Token** and copy the token. You
   won't use it for the foundation (the OAuth flow mints a per-install
   token instead), but the bot account needs to exist for the install
   flow to surface a "Add to server" button.
5. On the **OAuth2 → URL Generator** page, tick the **bot** and
   **applications.commands** scopes. Copy the generated URL — you'll
   use it as the install entry point, but the app's
   `/api/discord/install` route builds the same URL with the right
   state cookie, so the **Install** button on `/settings/discord` is
   the canonical path.

## 2. Set the env vars

Append to your `.env.local` (or whatever your deployment reads):

```bash
DISCORD_CLIENT_ID=<Application ID from step 2>
DISCORD_CLIENT_SECRET=<client secret from OAuth2 → General>
DISCORD_PUBLIC_KEY=<Ed25519 public key from step 3>
DISCORD_TOKEN_ENCRYPTION_KEY=$(openssl rand -base64 32)
```

`DISCORD_TOKEN_ENCRYPTION_KEY` must decode to exactly 32 bytes. The
install handler builds the redirect URI from the live request host
unless `DISCORD_REDIRECT_URI` is set — set it explicitly if your
deployment sits behind a proxy.

## 3. Register the interaction endpoint

On the **General Information** page, paste your **Interactions
Endpoint URL**:

```
https://<host>/api/discord/interactions
```

Discord will POST a PING to that URL. The handler responds with
`{ type: 1 }` and Discord marks the endpoint as verified.

## 4. Register the slash commands

The foundation registers five commands: `/balance`, `/address-book`,
`/propose`, `/sign`, `/help`. The fastest path is to register them via
the Discord HTTP API as the application bot:

```bash
# Replace <APP_ID> with your Application ID, and use a bot token from
# the Bot page of the application.
curl -X POST \
  -H "Authorization: Bot <BOT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "balance",
    "description": "Show the native balance of a multisig on a chain",
    "options": [
      { "name": "input", "description": "<chain> <multisig>", "type": 3, "required": true }
    ]
  }' \
  "https://discord.com/api/v10/applications/<APP_ID>/commands"
```

Repeat for `address-book`, `propose`, `sign`, and `help`. The
`commandRouter` in `src/lib/discord/commandRouter.ts` keys on
`/balance`, `/address-book`, `/propose`, `/sign`, `/help` and reads
the user's text from `data.options[0].value` (the `input` string).

## 5. Run the database migration

The new tables are additive and idempotent. Apply the schema:

```bash
psql "$DATABASE_URL" -f src/lib/db/schema.sql
```

Three new tables are created: `discord_workspaces`,
`discord_user_links`, `discord_channel_configs`. Existing tables are
untouched.

## 6. Install in a test server

1. `yarn dev` (or deploy the branch).
2. Sign in to the app with your wallet (the install flow records the
   wallet that initiated it in `installed_by_wallet`).
3. Visit `/settings/discord` and click **Add to a server**.
4. Complete the Discord OAuth consent screen, picking the server you
   want to add the bot to.
5. You'll be redirected back to `/settings/discord?installed=1`. The
   server appears in the list.

## 7. Verify

Smoke checks (no real Discord app required, just the env vars set):

```bash
# Should return 503 with a clear "not configured" message when env is unset.
curl -i -X POST http://localhost:3000/api/discord/interactions

# Should return 401 (no signature) once env is set.
curl -i -X POST http://localhost:3000/api/discord/interactions \
  -H 'Content-Type: application/json' \
  -d '{"type":1}'
```

End-to-end with a real Discord application (after install):

- The **General Information** page should show the interaction
  endpoint as verified after the first PING.
- In any channel, type `/balance mainnet 0xd8da6bf26964af9d7eed9e03e53415d37aa96045`
  — you should see an embed with the ETH balance of vitalik.eth on
  mainnet.
- Type `/address-book mainnet 0xd8da6bf26964af9d7eed9e03e53415d37aa96045`
  — the public address book label(s) should be listed.
- Type `/propose` — an ephemeral "coming soon" message with a button
  to the app should appear.
- Type `/sign some-fake-id` — same ephemeral pattern.

Uninstalling from `/settings/discord` calls Discord's
`DELETE /users/@me/guilds/{id}` and deletes the local rows.

## Known limits

- **3-second response deadline on interactions.** The handler responds
  synchronously; the next PR will move longer operations to
  `type: 5` (deferred) + a followup webhook call.
- **`installed_by_wallet` is nullable.** An install from a non-SIWE
  browser still succeeds; the row just doesn't appear in any wallet's
  `/api/discord/workspaces` list. A "claim this install" flow is the
  next PR.
- **Slash command responses are read-only.** `/propose` and `/sign`
  return "coming soon" messages with a button to the app page.
- **No channel binding yet.** The `discord_channel_configs` table
  exists so the next PR (new-request notifications) doesn't have to
  add a column, but the settings page doesn't expose bindings yet.
- **No gateway connection.** This PR only handles HTTP interactions.
  Bot-side events (member joins, message creates) are not received.
  The next PR that needs them will open a gateway connection via
  `DISCORD_BOT_TOKEN`.

## Troubleshooting

**`401 Invalid signature` on every interaction.** Most often the
`DISCORD_PUBLIC_KEY` env var is wrong or has a stray newline. The
verifier accepts the key with or without a `0x` prefix, but anything
else (whitespace, accidental `Bot ` prefix, etc.) is rejected. You can
verify locally:

```bash
node -e "
  const { ed25519 } = require('@noble/curves/ed25519');
  const key = process.argv[1];
  console.log(key.length, /^([0-9a-fA-F]{2})+$/.test(key.replace(/^0x/, '')));
" "$(echo -n $DISCORD_PUBLIC_KEY)"
```

Should print `64 true` (32 bytes, hex). 66 means a 0x prefix snuck in.

**`503 Discord app is not configured on this deployment`.** The
`discordConfig()` helper threw at module load. The most common cause
is `DISCORD_TOKEN_ENCRYPTION_KEY` not being a 32-byte base64 string.
Check `openssl rand -base64 32 | wc -c` (should print 45 including
the trailing newline — the base64 itself is 44 chars).

**`oauth_failed` after the install redirect.** Most often a redirect
URI mismatch. Discord rejects the install if the redirect URI doesn't
exactly match one of the URLs in **OAuth2 → General → Redirects**. The
install handler builds the URI from the live request host; if your
deployment sits behind a proxy, set `DISCORD_REDIRECT_URI`
explicitly.

**Interactions endpoint stays "Not verified"**. The handler returns
`{ type: 1 }` for PING (type 1) and `200 OK` for everything else. If
you see "URL didn't respond with 2xx", the most common cause is a
proxy stripping or rewriting the body before it reaches the handler.
The 1 MiB body cap in `readRawBody` exists to surface a clean error
in that case.
