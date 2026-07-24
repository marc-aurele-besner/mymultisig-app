# Slack integration

Foundation for a real Slack app that can be installed into a workspace, answers
slash commands (`/balance`, `/address-book`, `/propose`, `/sign`), and is wired
to Slack's event subscription and interactivity endpoints. The
"post a notification when a new request is created" loop is the next PR —
this one only lands the install + command + event plumbing.

The app registers a bot user, listens for `app_uninstalled` to clean up
local rows, and stores the bot token encrypted in Neon (`slack_workspaces`).

## Prerequisites

- A Slack workspace you control (use a test workspace; installs are
  workspace-wide).
- A mymultisig-app deployment reachable from the public internet
  (Slack's request URLs must be https).
- Neon `DATABASE_URL` already set (the schema is in
  `src/lib/db/schema.sql`; the new tables are additive).
- `SESSION_SECRET` (or its `PRIVATE_KEY` fallback) already set for SIWE
  cookies. The Slack OAuth state cookie uses the same secret.

## 1. Create the Slack app

Two options:

**Option A — one-click from a manifest** (recommended):

1. Run a search-and-replace over `docs/slack-manifest.json` to swap
   the four `__SLACK_*_URL__` placeholders for your public URLs.
   For example, if your app is hosted at `https://mymultisig.app`:

   ```bash
   sed -e 's|__SLACK_COMMANDS_URL__|https://mymultisig.app/api/slack/commands|g' \
       -e 's|__SLACK_OAUTH_REDIRECT_URL__|https://mymultisig.app/api/slack/oauth-callback|g' \
       -e 's|__SLACK_EVENTS_URL__|https://mymultisig.app/api/slack/events|g' \
       -e 's|__SLACK_INTERACTIVE_URL__|https://mymultisig.app/api/slack/interactive|g' \
       docs/slack-manifest.json > /tmp/manifest.json
   ```

2. Go to <https://api.slack.com/apps>, click **Create New App**, choose
   **From an app manifest**, pick your workspace, and paste the
   substituted manifest. Slack will create the app, the bot user, the
   five slash commands, and pre-fill the URLs.

**Option B — by hand**: create the app, then in **OAuth & Permissions**
add the redirect URL, in **Slash Commands** add the five commands
(`/balance`, `/address-book`, `/propose`, `/sign`, `/help`) with
Request URL `https://<host>/api/slack/commands`, in **Event
Subscriptions** enable events with Request URL
`https://<host>/api/slack/events` and subscribe to `app_uninstalled`
+ `app_mention`, and in **Interactivity & Shortcuts** enable
interactivity with Request URL
`https://<host>/api/slack/interactive`.

The bot scopes are: `commands`, `chat:write`, `chat:write.public`,
`users:read`, `app_mentions:read`.

## 2. Set the env vars

In `.env.local` (and in your deployment platform's secrets), set:

| Variable | Where to find it | Notes |
| --- | --- | --- |
| `SLACK_CLIENT_ID` | Slack app → **Basic Information** → **App Credentials** | public |
| `SLACK_CLIENT_SECRET` | same | keep secret |
| `SLACK_SIGNING_SECRET` | same | keep secret |
| `SLACK_TOKEN_ENCRYPTION_KEY` | generate locally | see below |
| `SLACK_REDIRECT_URI` (optional) | n/a | when unset, the install handler builds the URL from the request host |

Generate the encryption key (32 random bytes, base64):

```bash
openssl rand -base64 32
```

`SLACK_TOKEN_ENCRYPTION_KEY` must decode to exactly **32 bytes**; the
config helper rejects any other length at module load (so a wrong key
fails fast on the next request after restart, not on the first install).

## 3. Run the database migration

The new tables are additive and idempotent. Apply the schema:

```bash
psql "$DATABASE_URL" -f src/lib/db/schema.sql
```

Three new tables are created: `slack_workspaces`,
`slack_user_links`, `slack_channel_configs`. Existing tables are
untouched.

## 4. Install in a test workspace

1. `yarn dev` (or deploy the branch).
2. Sign in to the app with your wallet (the install flow records the
   wallet that initiated it in `installed_by_wallet`).
3. Visit `/settings/slack` and click **Install to a workspace**.
4. Complete the Slack OAuth consent screen.
5. You'll be redirected back to `/settings/slack?installed=1`. The
   workspace appears in the list.

## 5. Verify

Smoke checks (no real Slack app required, just the env vars set):

```bash
# Should return 503 with a clear "not configured" message when env is unset.
curl -i -X POST http://localhost:3000/api/slack/events

# Should return 401 (no signature) once env is set.
curl -i -X POST http://localhost:3000/api/slack/events -d '{"type":"url_verification","challenge":"abc","token":"x"}'
```

End-to-end with a real Slack app (after install):

- The Slack **Event Subscriptions** page should show **Verified** ✅
  next to the events URL after the first POST.
- In any channel, type `/balance 1 0xd8da6bf26964af9d7eed9e03e53415d37aa96045`
  — you should see a Block Kit message with the ETH balance of
  vitalik.eth on mainnet (1 ETH-equivalent is enough to verify the
  message shape).
- Type `/address-book 1 0xd8da6bf26964af9d7eed9e03e53415d37aa96045`
  — the public address book label(s) should be listed (vitalik.eth is
  a known example; if it's not in the public book, the message
  reports "No labels …").
- Type `/propose` — an ephemeral "coming soon" message with a button
  to the app should appear.
- Type `/sign some-fake-id` — same ephemeral pattern.

Uninstalling from `/settings/slack` calls Slack's `apps.uninstall` and
deletes the local rows. The next event from the workspace (or the
explicit app_uninstalled event) cleans up `slack_user_links` and
`slack_channel_configs` rows that the uninstall handler didn't
touch.

## Known limits

- **3-second response deadline on event subscriptions.** The
  `app_uninstalled` handler returns 200 first, then fires the three
  DB deletes asynchronously. Slack retries non-2xx up to 3 times, and
  the deletes are idempotent, so this is safe.
- **`installed_by_wallet` is nullable.** An install from a non-SIWE
  browser still succeeds; the row just doesn't appear in any wallet's
  `/api/slack/workspaces` list. A "claim this install" flow is the
  next PR.
- **Slash command responses are read-only.** `/propose` and `/sign`
  return "coming soon" messages with a button to the app page. The
  modals that actually propose and sign come next.
- **No channel binding yet.** The `slack_channel_configs` table exists
  so the next PR (new-request notifications) doesn't have to add a
  column, but the settings page doesn't expose bindings yet.

## Troubleshooting

**`401 Invalid signature` on every event.** Clock skew between your
host and Slack's servers — `verify.ts` rejects anything more than
5 minutes off. Check `date` on the box. Also: make sure
`SLACK_SIGNING_SECRET` is the **Signing Secret** from the app's
**Basic Information** page, not the **Verification Token** (which is
deprecated).

**`400 Missing or invalid payload` on every interactive event.** The
`payload` field is a URL-encoded JSON string. The handler already
parses it; this error means the form body itself is malformed (rare;
usually a proxy stripping the body).

**`503 Slack app is not configured on this deployment`.** The
`slackConfig()` helper threw at module load. The most common cause is
`SLACK_TOKEN_ENCRYPTION_KEY` not being a 32-byte base64 string. Check
`openssl rand -base64 32 | wc -c` (should print 45 including the
trailing newline — the base64 itself is 44 chars).

**`oauth_failed` after the install redirect.** Most often a redirect
URI mismatch. Slack rejects the install if the redirect URI doesn't
exactly match one of the URLs in **OAuth & Permissions** →
**Redirect URLs**. The install handler builds the URI from the live
request host; if your deployment sits behind a proxy, set
`SLACK_REDIRECT_URI` explicitly.
