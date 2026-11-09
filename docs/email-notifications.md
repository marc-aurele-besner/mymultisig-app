# Email notifications

Owners of a multisig can get an email when a request needs their signature
and again when it reaches its signing threshold. Email is sent through
[Resend](https://resend.com), the same provider as the contact form. It is
separate from the Slack, Discord and Telegram fan-out in
[notifications.md](./notifications.md).

## What gets sent

| Trigger | Recipients | Subject |
| --- | --- | --- |
| `POST /api/multisig-requests` creates a request that is below threshold | Verified owners who have not signed yet (the submitter is excluded) | `Signature needed on <wallet>` |
| `POST /api/multisig-requests` creates a request already at threshold, or `PATCH /api/multisig-requests/[id]` adds the signature that crosses the threshold | All verified owners | `Ready to execute on <wallet>` |
| A new or changed inbox is saved on `/settings/email` | That inbox only | `Confirm your MyMultiSig email notifications` |

Each notification has an **Unsubscribe** link that removes the inbox from
which it was sent.

## Setting up an inbox

1. Connect and sign in with an owner wallet, then open `/settings/email`.
2. Enter an address and submit. A confirmation link is emailed.
3. Click the link. Until then nothing is sent to the address.

An inbox is one row per wallet in `email_recipients`. Only a wallet that
appears in the `owners` array of at least one multisig can create one; the
endpoint returns 403 for anyone else. Changing the address clears the
verified flag and issues a new link token, so old links stop working.

## Endpoints

- `GET /api/email/subscription`: session required. Returns `{ isOwner, subscription }`.
- `PUT /api/email/subscription` with `{ "email": "..." }`: session required. Sends the confirmation email. Returns 502 if Resend fails, and the row stays unverified.
- `DELETE /api/email/subscription`: session required. Removes the inbox.
- `GET /api/email/confirm?token=…`: public, from the confirm link. Redirects to `/settings/email?email=confirmed|invalid`.
- `GET /api/email/unsubscribe?token=…`: public, from every notification. Redirects to `/settings/email?email=unsubscribed|invalid`.

## Configuration

Uses the same variables as the contact form:

- `RESEND_API_KEY` (required). When unset, sends are skipped and logged.
- `RESEND_FROM` (recommended in production). The default sender,
  `MyMultiSig <onboarding@resend.dev>`, only delivers to the Resend account
  owner. Use an address on a domain verified in Resend.

Links in email point at `https://mymultisig.app` (see
`src/lib/email/links.ts`), so preview deployments send production links.

## Database

Run `src/lib/db/schema.sql` against Neon. It creates `email_recipients` with
`CREATE TABLE IF NOT EXISTS`, so re-running it is safe.

## Failure behaviour

Email is fire-and-forget, like the chat dispatcher. A Resend failure is
logged with the wallet address and never changes the status code of the
request endpoints. The recipient address is not logged.

## Smoke check

1. Subscribe an owner inbox on `/settings/email`, then click the confirm link.
2. Create a request on that multisig from another owner wallet.
3. Expect one `Signature needed` email to the inbox, unless that owner has
   already signed.
4. Sign until the threshold is met. Expect one `Ready to execute` email.
5. Click **Unsubscribe** in an email. Expect a redirect to
   `/settings/email?email=unsubscribed` and no further mail.
