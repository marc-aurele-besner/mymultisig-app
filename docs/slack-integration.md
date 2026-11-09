# Slack integration

MyMultiSig ships a Slack app that **any team can add to its own workspace**.
Once it is added, a channel bound to a multisig gets a message:

- when a **new request** is proposed on that multisig, and
- when a request **reaches the signing threshold** and is ready to execute.

Each message links to the request page, where owners sign or execute with
their own wallet. The bot holds no keys and cannot sign or execute anything.

This page covers both sides:

1. [Operator setup](#operator-setup): one-time work by whoever runs the
   deployment (create the Slack app, set env vars, turn on public
   distribution).
2. [Using it in a workspace](#using-it-in-a-workspace): what any team does
   to start getting notifications.

The app manifest is [`docs/slack-manifest.json`](./slack-manifest.json).

---

## Operator setup

You do this once per deployment (for example once for `mymultisig.app`, and
once more if you want a separate app for staging or local development).

### 0. Prerequisites

- The deployment is reachable over **HTTPS** (Slack rejects plain-HTTP
  request URLs). For local work, use a tunnel such as `cloudflared` or
  `ngrok` and a separate dev Slack app.
- `DATABASE_URL` is set and the schema is applied (step 4).
- `SESSION_SECRET` is set. The OAuth state cookie is signed with it.
- Optional: `NEXT_PUBLIC_APP_URL` if the deployment is not
  `https://mymultisig.app`. Links inside Slack messages use it.

### 1. Create the Slack app from the manifest

Render the manifest with your public host. For `https://mymultisig.app`:

```bash
HOST=https://mymultisig.app
sed -e "s|__SLACK_COMMANDS_URL__|$HOST/api/slack/commands|g" \
    -e "s|__SLACK_OAUTH_REDIRECT_URL__|$HOST/api/slack/oauth-callback|g" \
    -e "s|__SLACK_EVENTS_URL__|$HOST/api/slack/events|g" \
    -e "s|__SLACK_INTERACTIVE_URL__|$HOST/api/slack/interactive|g" \
    docs/slack-manifest.json > slack-manifest.rendered.json
```

Then:

1. Open <https://api.slack.com/apps> and click **Create New App** →
   **From a manifest**.
2. Pick a workspace you administer. This is only the app's "home"
   workspace; other workspaces can still install it after step 5.
3. Paste the contents of `slack-manifest.rendered.json` (JSON tab), review,
   and click **Create**.

Slack may warn that the Event Subscriptions URL is not verified yet. That is
expected: the endpoint needs the signing secret from the next step. You
will verify it in step 6.

The manifest creates:

| What | Value |
| --- | --- |
| Bot user | `@MyMultiSig` |
| Slash commands | `/multisig`, `/bind`, `/unbind`, `/balance`, `/address-book`, `/propose`, `/sign` |
| Bot scopes | `commands`, `chat:write`, `chat:write.public`, `app_mentions:read` |
| Bot events | `app_uninstalled`, `tokens_revoked`, `app_mention` |
| Interactivity | on, pointed at `/api/slack/interactive` |

The bot scopes in the manifest must match `SCOPES` in
`src/pages/api/slack/install.ts`. If you change one, change the other.

#### Optional: app icon

Under **Basic Information** → **Display Information**, upload a square
icon (512×512 to 2000×2000 px); `public/icons/android-icon-512x512 1.png`
works.
Slack requires an icon before you can submit to the Slack Marketplace, but
not for public distribution.

### 2. Copy the credentials

From **Basic Information** → **App Credentials**, copy:

| Env var | Slack field |
| --- | --- |
| `SLACK_CLIENT_ID` | Client ID |
| `SLACK_CLIENT_SECRET` | Client Secret |
| `SLACK_SIGNING_SECRET` | Signing Secret (not the deprecated Verification Token) |

Generate the token encryption key locally:

```bash
openssl rand -base64 32
```

| Env var | Value |
| --- | --- |
| `SLACK_TOKEN_ENCRYPTION_KEY` | output of the command above (must decode to exactly 32 bytes) |
| `SLACK_REDIRECT_URI` (optional) | `https://<host>/api/slack/oauth-callback`. Only needed when the `Host` header the app sees differs from the public host (proxies, custom domains). |

Bot tokens are stored AES-256-GCM encrypted with this key. Rotating the key
makes every stored token unreadable, and every workspace has to add the app
again, so keep it stable.

### 3. Set the env vars and redeploy

On Netlify: **Site configuration** → **Environment variables**, add the
four (or five) variables above, then trigger a new deploy. For local dev,
put them in `.env.local`.

Check the deployment picked them up:

```bash
# Before: 503 "Slack app is not configured on this deployment"
# After:  401 "Invalid signature" (the endpoint is live and checking signatures)
curl -i -X POST https://<host>/api/slack/events -d '{}'
```

### 4. Apply the database schema

The Slack tables are additive and the script is idempotent:

```bash
psql "$DATABASE_URL" -f src/lib/db/schema.sql
```

This creates `slack_workspaces`, `slack_user_links` and
`slack_channel_configs` if they don't exist.

### 5. Turn on public distribution

Without this, only the home workspace can install the app; everyone else
gets `invalid_team_for_non_distributed_app`.

1. In the app settings, open **Manage Distribution**.
2. Work through **Share Your App with Other Workspaces**:
   - **Remove Hard Coded Information**: tick the box (the app has none).
   - **Use HTTPS For Your Features**: passes if your URLs are https.
   - **Add OAuth Redirect URLs**: already set by the manifest.
3. Click **Activate Public Distribution**.

That is enough for **any workspace to install the app** through
`/settings/slack`. Listing it in the Slack Marketplace is optional and goes
through Slack's review; you don't need it for the install link to work.

### 6. Verify the event URL

Open **Event Subscriptions**. If the Request URL shows as unverified, click
**Retry** (or re-save the URL). It should turn to **Verified ✓**. If it
doesn't, see [Troubleshooting](#troubleshooting).

### 7. Smoke test

1. Open `https://<host>/settings/slack`, connect your wallet and sign in.
2. Click **Add to Slack**, choose a workspace, click **Allow**. You land
   back on the settings page and the workspace is listed.
3. In a public channel, run `/bind sepolia <a multisig address you own>`.
   The bot posts a "connected this channel" message and you get an
   ephemeral confirmation.
4. Create a request on that multisig in the app. A **New request** message
   appears in the channel within a second or two.
5. Sign it until it reaches the threshold. A **Ready to execute** message
   follows.
6. Mention `@MyMultiSig` in the channel. It replies in a thread with the
   command list.

---

## Using it in a workspace

This is what any team does. It is also summarised on `/settings/slack`.

1. **Add the app.** Go to `https://mymultisig.app/settings/slack`, connect
   and sign in with your wallet, and click **Add to Slack**. You need
   permission to install apps in the workspace; if your workspace requires
   admin approval, Slack sends the request to your admins.
2. **Bind a channel.** In the channel that should get notifications:

   ```
   /bind <chain> <multisig address>
   /bind sepolia 0x1234…abcd
   /bind 1 0x1234…abcd
   ```

   `<chain>` is a name or a chain id from the supported networks:
   `mainnet`, `sepolia`, `goerli`, `polygon`, `mumbai`, `optimism`,
   `optimism-goerli`, `arbitrum`, `arbitrum-goerli`, `avalanche`, `fuji`,
   `bsc`, `bsc-testnet`, `gnosis`, `chiado` (see
   `src/constants/networks.ts`). For a **private channel**, run
   `/invite @MyMultiSig` first. Direct messages can't be bound.
3. **Done.** New requests and ready-to-execute requests on that multisig
   are posted in the channel. You can bind several multisigs to one
   channel, and one multisig to several channels.

### Commands

Every command also works namespaced, as `/multisig <command> …`. Use that
form if another app in your workspace already owns `/bind` or `/balance`.

| Command | What it does |
| --- | --- |
| `/bind <chain> <multisig>` | Post this multisig's notifications in this channel |
| `/unbind <chain> <multisig>` | Stop posting them here |
| `/balance <chain> <address>` | Native balance of an address |
| `/address-book <chain> <address>` | Public MyMultiSig labels for an address |
| `/propose` | Link to the app to propose a request |
| `/sign <request id>` | Link to a request in the app to sign it |
| `/multisig help` | Command list (same as mentioning `@MyMultiSig`) |

### Managing it from the app

`/settings/slack` lists the workspaces you added while signed in with your
wallet, and every channel binding in them (including ones teammates made
with `/bind`). From there you can unbind a channel or uninstall the app
from a workspace.

Removing the app from Slack's side (workspace settings → **Manage apps**)
also works: the `app_uninstalled` event deletes the workspace's bot token
and bindings.

### Who can bind?

Anyone in a channel where the app is installed can `/bind` or `/unbind`
it, matching "anyone in the room can configure the room". There is no
wallet ownership check on `/bind` yet, because slash commands don't carry a
wallet. Binding only controls where notifications go; it gives no access to
the multisig.

---

## How it works

```
Slack workspace                        MyMultiSig (Next.js API routes)
───────────────                        ──────────────────────────────
"Add to Slack" ──────────────────────► GET  /api/slack/install        (signed state cookie)
Slack consent screen ───────────────► GET  /api/slack/oauth-callback  → slack_workspaces (token encrypted)
/bind, /multisig, … ─────────────────► POST /api/slack/commands       → slack_channel_configs
@mention, uninstall, token revoked ─► POST /api/slack/events
button clicks ──────────────────────► POST /api/slack/interactive     (acknowledged; buttons are links)

POST  /api/multisig-requests      ──► notifyNewRequest       ──► chat.postMessage to every bound channel
PATCH /api/multisig-requests/[id] ──► notifyReadyToExecute   ──► chat.postMessage (when threshold is crossed)
```

- Every inbound Slack request is checked against `SLACK_SIGNING_SECRET`
  (`src/lib/slack/verify.ts`), with a 5-minute replay window.
- Notifications are fire-and-forget: a Slack failure is logged and never
  changes the response of the request endpoints.
- Request descriptions are escaped before they go into a message, so a
  description can't `@channel` the room or inject links.
- `/bind` posts its confirmation into the channel with the bot token. If
  that fails (bot not in a private channel, archived channel, DM), the
  binding is rolled back and the user is told how to fix it, so a binding
  never silently delivers nothing.

Cross-platform details (Discord, Telegram, shared dispatcher) are in
[notifications.md](./notifications.md).

## Endpoints

| Route | Auth | Purpose |
| --- | --- | --- |
| `GET /api/slack/install` | none | Start OAuth. Optional `return_to`, `team`. |
| `GET /api/slack/oauth-callback` | state cookie | Finish OAuth; records the signed-in wallet as installer when there is one. |
| `POST /api/slack/commands` | Slack signature | Slash commands. |
| `POST /api/slack/events` | Slack signature | URL verification, `app_uninstalled`, `tokens_revoked`, `app_mention`. |
| `POST /api/slack/interactive` | Slack signature | Acknowledges interactivity payloads. |
| `GET /api/slack/workspaces` | SIWE session | Workspaces installed by the signed-in wallet. |
| `DELETE /api/slack/workspaces/[teamId]` | SIWE session, installer only | Uninstall (calls `apps.uninstall`). |
| `GET/POST /api/slack/channel-bindings` | SIWE session, installer only | List / create bindings. |
| `DELETE /api/slack/channel-bindings/[bindingId]` | SIWE session, installer only | Remove a binding. |

## Known limits

- **Only Slack gets the ready-to-execute message.** Discord and Telegram
  still post new requests only.
- **Workspaces added while signed out have no owner in the app.** The
  install still works and `/bind` still delivers, but the workspace won't
  appear on anyone's `/settings/slack`. Add the app again while signed in
  to claim it; a re-install keeps the first wallet that claimed it.
- **Notifications run after the API response.** They are started before
  the response is sent and normally finish within a second, but a
  serverless platform that freezes the function immediately could drop
  one. Check the function logs for `notifyNewRequest` /
  `notifyReadyToExecute` if a message is missing.
- **`/propose` and `/sign` link to the app.** Proposing and signing need
  the user's wallet, so they can't happen inside Slack.

## Troubleshooting

**`invalid_team_for_non_distributed_app` on the consent screen.** Public
distribution isn't active. Do [step 5](#5-turn-on-public-distribution).

**`bad_redirect_uri` / `oauth_failed` after Allow.** The redirect URI the
app sends must exactly match one in **OAuth & Permissions** → **Redirect
URLs**. The install handler builds it from the request host; behind a proxy
or on a custom domain, set `SLACK_REDIRECT_URI`.

**`state_invalid` after Allow.** The state cookie expired (10 minutes) or
was set on a different host (for example you started on `www.` and came
back on the apex). Start again from `/settings/slack` on the same host as
the redirect URL.

**`503 Slack app is not configured on this deployment`.** One of the four
required env vars is missing, or `SLACK_TOKEN_ENCRYPTION_KEY` doesn't
decode to 32 bytes. Regenerate it with `openssl rand -base64 32` and
redeploy.

**`401 Invalid signature` on every request / event URL won't verify.**
`SLACK_SIGNING_SECRET` is wrong (it is the **Signing Secret**, not the
Verification Token), the deploy hasn't picked up the env var yet, or the
server clock is more than 5 minutes off.

**`/bind` says the workspace is not connected.** The app was installed with
Slack's own **Install to Workspace** button on api.slack.com, which skips
MyMultiSig's OAuth callback, so there is no stored bot token. Add it again
from `/settings/slack`.

**`/bind` says it can't post here (`not_in_channel`).** Private channel:
`/invite @MyMultiSig`, then `/bind` again.

**No message after creating a request.** Check that the binding's chain
matches the multisig's chain (`/bind sepolia …` vs. `/bind mainnet …`),
that the multisig is indexed in the app (the dispatcher needs its
`multisig_wallets` row for chain and threshold), and look for
`notifyNewRequest: slack channel … failed` in the function logs. A
`token_revoked` / `account_inactive` error there means the app was removed
from that workspace.
