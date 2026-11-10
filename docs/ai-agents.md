# AI agent integrations

This guide is for operators and contributors. For the user guide, see `/docs/ai-agents` in the app (`src/pages/docs/ai-agents.tsx`).

## Pieces

| Piece | Path | npm | Purpose |
|---|---|---|---|
| Protocol core | `packages/sdk/src/protocol` | `mymultisig-sdk/protocol` | EIP-712 typed data, signature blobs, `execTransaction` overloads, factory create/predict calls. The **web app imports these too**, via the `@mymultisig/protocol` tsconfig alias, so the browser and agents can't drift apart. |
| SDK | `packages/sdk` | `mymultisig-sdk` | `MyMultiSigClient`: viem reads and writes, local signing, signature verification, REST client (API key or SIWE). |
| MCP server | `packages/mcp` | `mymultisig-mcp` | stdio MCP server wrapping the SDK. Read tools are always on; write tools are on unless `MYMULTISIG_READ_ONLY=1`. |
| CLI | `packages/cli` | `mymultisig-cli` | `mymultisig …` commands with human or `--json` output. Irreversible actions need `--yes` when the shell isn't interactive. |
| Claude Code plugin | `plugins/mymultisig`, `.claude-plugin/marketplace.json` | — | Bundles the MCP server config and five workflow skills. |
| API keys | `src/lib/auth/apiKey.ts`, `src/pages/api/agent-keys/*`, `/settings/api-keys` | — | Scoped Bearer keys for headless agents. |
| Machine-readable docs | `public/llms.txt`, `public/openapi.json` | — | For LLMs and API clients. |

## Trust model

- **Keys never reach the server.** API keys authenticate REST calls only. On-chain signing (EIP-712 approvals) and execution use `MYMULTISIG_PRIVATE_KEY`, which stays on the agent's machine. Recommend a dedicated key that is added as an owner, with a threshold the agent can't reach alone.
- **API keys are opt-in per endpoint.**
  - A route accepts a Bearer key only when it passes `{ apiKeyScope }` to `withSession`, `withVerifiedAs` or `withVerifiedAsOwner` (`src/lib/api/middleware.ts`).
  - On any other route, a Bearer token is a 401.
  - This keeps key management, Slack/Discord/Telegram, email and admin SIWE-only.
- **How a key acts:**
  - It acts as the wallet that minted it (`owner_address`), so identity checks (`withVerifiedAs`) and owner checks (`withVerifiedAsOwner`) still apply.
  - A key with `wallet_addresses` set can only mutate those multisigs (`callerMayActOn`).
  - An invalid, revoked or expired key is a hard 401. It never falls back to the cookie.

| Scope | Endpoints |
|---|---|
| `read` | `GET /api/multisig-wallets`, `GET /api/address-book`, `GET /api/saved-contracts`, `GET /api/factories` |
| `propose` | `POST /api/multisig-requests` |
| `sign` | `PATCH /api/multisig-requests/[id]` (signatures, execution status) |
| `manage` | `DELETE /api/multisig-requests/[id]`, `/cancel`, `/reset`, `POST`/`PATCH /api/multisig-wallets`, address book, saved contracts and factories writes |
| *(any valid key)* | `GET /api/agent-keys/whoami` |
| *(SIWE only)* | `/api/agent-keys` list/create/revoke, `/cascade`, integrations, email, admin |

- **Storage:**
  - Keys are `mms_` followed by 32 base62 characters.
  - Only `sha256(key)` is stored, in the `agent_api_keys` table.
  - `key_prefix` (the first 12 characters) is shown in the UI.
  - `last_used_at` is updated at most once a minute.
  - Each wallet can have at most 20 active keys.

## Database

Apply the new table with:

```
psql $DATABASE_URL -f src/lib/db/schema.sql
```

The script is idempotent (`CREATE TABLE IF NOT EXISTS agent_api_keys …`).

## Development

```bash
yarn install
yarn packages:build      # sdk -> mcp -> cli (tsup)
yarn packages:test       # vitest in each package

# MCP inspector against a local app
MYMULTISIG_API_URL=http://localhost:3000 MYMULTISIG_CHAINS=11155111 \
  npx @modelcontextprotocol/inspector node packages/mcp/dist/index.js

# CLI from source build
node packages/cli/dist/index.js --json request list 11155111 0x…
```

## Publishing

The packages are published separately from the app. Publish the SDK first, because the MCP server and the CLI depend on it.

npm publishing requires a 2FA OTP, so run it yourself:

```bash
yarn packages:build && yarn packages:test
(cd packages/sdk && npm publish --otp <code>)
(cd packages/mcp && npm publish --otp <code>)
(cd packages/cli && npm publish --otp <code>)
```

The plugin's `.mcp.json` pins `mymultisig-mcp@0.1`. Bump it when you ship a breaking change.

npm 10.8.x has a web-login bug: it polls once, gets `202`, and exits ("Exit handler never called"). Use npm 11 for login and publish:
- `npx -y npm@11 login`
- `npx -y npm@11 publish --otp <code>`

### MCP Registry

`mymultisig-mcp` is listed in the [official MCP Registry](https://registry.modelcontextprotocol.io) as `io.github.marc-aurele-besner/mymultisig-mcp`.

- `packages/mcp/server.json` is the registry manifest.
- The registry verifies npm ownership through the `mcpName` field in `packages/mcp/package.json`. That means a version has to be on npm *before* it can be listed.
- A test keeps `server.json` in sync with `package.json`.

For every MCP release:

1. Bump the version in `package.json` and in both `version` fields of `server.json`.
2. Publish the package to npm.
3. Then publish to the registry:

```bash
brew install mcp-publisher        # once
cd packages/mcp
mcp-publisher login github        # device-code login; the io.github.marc-aurele-besner/ namespace needs this account
mcp-publisher publish
```

## Known gaps and follow-ups

- **Signatures aren't recovered server-side.** The server still doesn't recover signatures on `POST`/`PATCH /api/multisig-requests`. The SDK verifies them locally (`verifyRequestSignatures`) before it signs on top of them or executes. Server-side recovery would protect every client.
- **Some write routes only need a session.** `POST`/`PATCH /api/multisig-wallets` and `/cascade` require a session but no owner check. API keys need the `manage` scope there.
- **The wallet allowlist only covers writes.** List endpoints return everything the key owner can see.
- **Requests with `mode: 'userop'` aren't supported.** They are signed over the EntryPoint hash and sent through a bundler from the app. The SDK refuses to approve or execute them.
- **Agents must be EOAs.** SIWE recovery only handles EOA signatures, so smart-account agents can't sign in.
- **There is no remote HTTP MCP endpoint yet.** The server is local stdio only.
