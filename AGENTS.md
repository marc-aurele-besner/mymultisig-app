# AGENTS.md

Shared guidance for every coding agent working in this repository (Codex, Cursor, Copilot, Jules, Claude Code and others). Claude-specific notes live in `CLAUDE.md`.

## Project overview

MyMultiSig (`mymultisig-app`) is the web app for creating and operating on-chain multisig wallets (mymultisig.app). Owners queue transaction requests, collect EIP-712 signatures off-chain, and execute on-chain once the threshold is met. The same protocol is exposed to agents through an SDK, an MCP server, a CLI and a Claude Code plugin.

## Tech stack

- Next.js (Pages Router) with React 19, TypeScript in strict mode, deployed on Netlify.
- UI: shadcn/ui + Tailwind CSS v4 (theme tokens in `src/styles/globals.css`), `next-themes`, lucide-react icons.
- Web3: wagmi v3 + viem v2; ABIs and factory addresses come from the `mymultisig-contract` npm package.
- State: Zustand v5 with `persist` (localStorage).
- Backend: Next.js API routes with Neon PostgreSQL (`@neondatabase/serverless`) and SIWE session cookies.
- Package manager: **Yarn 1** (`yarn.lock`). Node 20 or newer (CI uses Node 26).

## Layout

- `src/pages/` — pages and `src/pages/api/` routes (one endpoint per action).
- `src/components/` — UI. `ui/` holds shadcn primitives, `shell/` the app shell and navigation, `common/` shared wallet blocks, `forms/`, `modals/`, `views/`.
- `src/hooks/`, `src/states/` (Zustand stores), `src/utils/`, `src/constants/` (networks, ABIs), `src/lib/` (db, auth, api middleware, email, slack).
- `src/lib/db/schema.sql` — database schema.
- `packages/sdk`, `packages/mcp`, `packages/cli` — agent packages (`mymultisig-sdk`, `mymultisig-mcp`, `mymultisig-cli`), yarn workspaces built with tsup and tested with vitest. They are excluded from the root tsconfig.
- `plugins/mymultisig` — Claude Code plugin (skills + `.mcp.json`); `plugins/mymultisig-skills` is a server-less copy of its skills. Edit `plugins/mymultisig/skills`, then copy to `plugins/mymultisig-skills/skills`; CI runs `diff -r` on the two.
- `docs/` — integration docs (`ai-agents.md`, `slack-integration.md`, `email-notifications.md`, …).
- Protocol code (EIP-712 typed data, signature blobs, call builders) lives in `packages/sdk`. The app imports it via the `@mymultisig/protocol` tsconfig alias; the matching files in `src/utils/` are re-export shims, so change the package, not the shims.

## Setup and commands

```bash
yarn                  # install (runs husky via "prepare")
cp .env.sample .env.local   # then fill in values (see Environment)
yarn dev              # Next.js dev server (webpack)
yarn netlify dev      # dev server with Netlify Functions
yarn build            # production build (next build --webpack)
yarn storybook        # Storybook on port 6006
yarn packages:build   # build sdk -> mcp -> cli
yarn packages:test    # vitest in sdk, mcp, cli
```

Serve a finished build with `npx next start`, not `yarn start` (`yarn start` runs `start.sh`, which pulls, installs and builds).

## Verifying a change

Run what applies before opening a PR; CI (`.github/workflows/next-build.yml`) runs the first four steps below on every pull request.

1. `yarn packages:build` and `yarn packages:test` — required whenever `packages/` or protocol code changes.
2. `diff -r plugins/mymultisig/skills plugins/mymultisig-skills/skills` — must print nothing.
3. `yarn build` — the main gate; it type-checks the app.
4. `npx tsc --noEmit` — type check of the app alone.
5. `npx eslint <changed files>` — lint-staged runs `eslint --fix` on staged `src/**` files at commit time.
6. `yarn workspace mymultisig-sdk typecheck` (or `mymultisig-mcp`, `mymultisig-cli`) — type check of one package.

Known gaps: `yarn prettier` already reports unformatted files on `main`, and `npx jest` is not wired into CI (the only Jest-style test is `src/utils/formatNativeAmount.test.ts`). Do not reformat untouched files. Compare against `origin/main` before blaming your change for a failure there.

## Conventions

- Functional components with typed props interfaces; style with Tailwind classes and `cn()` from `src/lib/utils.ts`.
- Every component has a `.stories.tsx` file.
- Match the surrounding code for naming and imports; keep changes scoped to the task.
- Navigation destinations are defined once in `src/components/shell/navigation.ts`; add new ones there.
- Show addresses with `AddressRow`, not raw hex.
- Contract writes go through a domain hook that delegates to `useFinalizeTransaction`; after on-chain success, update Neon through a typed helper in `src/utils/api.ts`, then Zustand.
- API routes wrap auth with `withSession` / `withVerifiedAs` / `withVerifiedAsOwner` from `src/lib/api/middleware.ts`. Agent API keys (`Authorization: Bearer mms_…`) work only on routes that opt in with `apiKeyScope`.
- Use `useChainId()` + `useChains()` for network context and `useReadContracts` for batched reads.

## Git workflow

- Fetch, then branch from `origin/main`: `git checkout -b <type>/<short-description> origin/main` with prefixes `feat/`, `fix/`, `refactor/`, `docs/`.
- Commit messages follow **Conventional Commits** (commitlint config in `commitlint.config.js`). Make small, logical commits that explain why.
- Open a pull request against `main` and fill in `.github/pull_request_template.md`. Never push directly to `main`. Code owners are in `.github/CODEOWNERS`.
- Dependency bumps come from Renovate (`.github/renovate.json`).

## Architecture

**Next.js Pages Router** with React 19, TypeScript (strict mode), deployed on Netlify.

### UI Layer
- **shadcn/ui** with **Tailwind CSS v4**; theme via CSS variables in `src/styles/globals.css`; `next-themes` for dark mode.
- UI primitives in `src/components/ui/` (button, input, label, card, dialog, dropdown-menu, select, switch, textarea, sheet); `src/lib/utils.ts` provides `cn()` for class merging.
- **Icons**: `src/components/icons/ChakraIcons.tsx` re-exports lucide-react with a small wrapper (same API: `boxSize`, `className`).

### App shell (`src/components/shell/`)
- `src/components/dom/Layout.tsx` is a sidebar app shell: `SidebarNav` (wallet switcher + navigation) beside a column with `TopBar`, the page and the footer. Below `lg` the sidebar moves into a sheet and `MobileTabBar` takes over; `CommandPalette` opens with Cmd/Ctrl+K.
- Navigation is defined once in `shell/navigation.ts` (`WALLET_SECTIONS`, `WORKSPACE_NAV`, `EXPLORE_NAV`) and reused by the sidebar, the wallet tab strip (`MultiSigNav`, small screens only) and the palette. Add a destination there, not in the components.
- `useActiveWallet` picks the wallet the navigation points at (URL, then last opened, then first on the current chain). Wallet and request pages read the chain the app is on, so links to a wallet on another network go through `useNavigateOnChain`, which switches chain first.
- `InboxProvider` / `useInbox` (`src/hooks/useInbox.tsx`) loads the request queue of every saved multisig once and feeds the sidebar badges, the tab bar, the palette and the connected home (`views/Inbox.tsx`). It classifies from stored wallet data and off-chain signatures only; on-chain approvals are resolved on the request page.
- `/` renders `Welcome` in the static HTML and swaps to `Inbox` once a wallet is connected. Wallet and request pages render `ConnectPrompt` instead of nothing when disconnected.
- `useOnboarding` derives the getting-started checklist (`/get-started`, sidebar chip, inbox card) from real state; `src/states/onboarding.ts` only stores "hidden" and "visited notifications".
- Connecting goes through one dialog, `modals/ConnectModal.tsx`, opened via the `states/connectModal.ts` store. The risk disclaimer is asked for inside `views/ConnectWallet.tsx` the first time a wallet is picked, not on page load.
- Top-level pages open with `components/layout/PageHero.tsx` (typed eyebrow, word-reveal title, optional animated visual). Third-party marks (Slack, Discord, Telegram, email) come from `icons/BrandIcon.tsx`.
- Wallet pages are built from `components/common/` (`SectionCard`, `AddressRow`, `Identicon`). Show addresses with `AddressRow`, not raw hex.
- The request builder (`forms/CreateMultiSigRequestForm.tsx`) has templates (send funds, send a token, call, batch, raw) over one generic step model, plus a live preview that holds the sign button. A template only presets and hides fields; "Send a token" is a `transfer(to, amount)` step with `contractKey: 'erc20'`.
- Wallet settings (`views/MultiSigSettings.tsx`) are split into sections by `?section=`; the legacy `#rpc` anchor maps to the Connection section. Panels a wallet cannot use render a `Locked` explainer instead of disappearing.
- Code snippets use `components/ui/code-block.tsx` (JSON and shell colouring). Its colours are the `--code-*` tokens in `globals.css`, defined for both themes.
- Account settings pages share `components/settings/SettingsLayout.tsx`. Notifications live on `/integration`; agent and developer tooling on `/agents`.

### Web3
- **wagmi v3 + viem v2** for all on-chain reads/writes
- Wallet connectors configured in `src/components/web3/Web3Provider.tsx` (MetaMask, Coinbase, WalletConnect v2, Injected)
- Supported chains defined in `src/constants/networks.ts` (15 chains from `viem/chains`)
- Factory addresses and ABIs from the `mymultisig-contract` npm package
- `@ethersproject/abi` provides the `JsonFragment` ABI types (no ethers runtime dependency)

### Agent integrations (`packages/`, `plugins/`)
- `packages/sdk` (`mymultisig-sdk`): shared protocol core + `MyMultiSigClient`. The app imports the protocol helpers (EIP-712 typed data, signature blobs, `execTransaction`/create call builders, legacy ABI fragments) via the `@mymultisig/protocol` tsconfig alias; `src/utils/{contractVersions,transactionTypedData,signatureBlob}.ts` and `src/constants/abi/legacy.ts` are re-export shims. Change protocol code in the package, not the shims.
- `packages/mcp` (`mymultisig-mcp`, stdio MCP server) and `packages/cli` (`mymultisig-cli`) wrap the SDK; `plugins/mymultisig` is the Claude Code plugin (skills + `.mcp.json`), listed by `.claude-plugin/marketplace.json`. `plugins/mymultisig-skills` is a server-less copy for the Claude plugin directory; edit skills in `plugins/mymultisig/skills` and copy them over (CI diffs the two).
- Packages are excluded from the root tsconfig and use vitest (not jest). See `docs/ai-agents.md`.

### State Management
- **Zustand v5** with `persist` middleware (localStorage)
- `src/states/contracts.ts` — user-added contracts store
- `src/states/multiSigs.ts` — multisig factories, deployed multisigs, selected address, transaction requests

### Backend / Data Persistence
- **Neon PostgreSQL** via `@neondatabase/serverless` for storing multisig wallets and transaction requests
- Schema in `src/lib/db/schema.sql`; client in `src/lib/db/neon.ts`
- Auth via SIWE session cookies (`src/lib/auth/siwe.ts`): writes require a valid session, and identity-claiming actions must match the session wallet (`isVerifiedAs`)
- Scoped agent API keys (`Authorization: Bearer mms_…`, `src/lib/auth/apiKey.ts`, table `agent_api_keys`) are accepted only by routes that opt in with `{ apiKeyScope: 'read' | 'propose' | 'sign' | 'manage' }` on the middleware wrappers; everything else stays SIWE-only. Keys are managed at `/settings/api-keys` (client setup snippets live on `/settings/agents`) via `/api/agent-keys` (SIWE-only).
- API routes in `src/pages/api/` handle CRUD with one dedicated endpoint per action (e.g. `POST /api/multisig-requests`, `PATCH /api/multisig-requests/[id]`); per-endpoint auth is wrapped in `withSession` / `withVerifiedAs` from `src/lib/api/middleware.ts`. Public reads (`GET /api/multisig-requests`, `GET /api/multisig-requests/[id]`) skip the session guard so the detail view can render before sign-in, but serve raw signatures (`signatures` and `request.signatures`) only to the wallet's owners (SIWE session or a `read`-scope API key); everyone else gets `signatures: []` plus `signaturesRedacted: true` (`src/lib/api/signatureAccess.ts`). Count signatures with `signatureCount()` (`src/utils/requestSignatures.ts`), which falls back to `ownerSigners`. `PATCH` refuses (409) a `signatures` / `ownerSigners` array that does not keep the stored entries as a prefix, unless it is `[]` (a reset).

## Key patterns

### Transaction Hook Pattern
All contract writes follow the same flow:
1. Domain hook (e.g., `useCreateMultiSig`, `useExecTransaction`) builds wagmi config
2. Delegates to `useFinalizeTransaction` which wraps `useWriteContract` + `useWaitForTransactionReceipt`
3. `useFinalizeTransaction` manages toast notifications (info → success/error)
4. Domain hooks use `useWatchContractEvent` for on-chain events, then update Neon via API routes and Zustand state locally

### Data Flow for Mutations
1. User action triggers a wagmi write
2. On success event, hook calls a typed helper from `src/utils/api.ts` (`addMultiSigRequest`, `patchMultiSigRequest`, `createMultiSigWallet`, `upsertAddressBookEntry`, `removeAddressBookEntry`, …) which hits the matching dedicated endpoint (e.g. `PATCH /api/multisig-requests/[id]`)
3. API route checks the SIWE session cookie (via `withSession` / `withVerifiedAs` from `src/lib/api/middleware.ts`) before writing to Neon
4. Zustand store updated locally on API success

### Component Conventions
- Functional components with typed props interfaces
- Styling via Tailwind classes and shadcn variants (e.g. `className={cn(...)}`)
- Every component has a `.stories.tsx` file
- Use `useChainId()` + `useChains()` for chain/network context
- Use `useReadContracts` for batched multicall reads (see `useMultiSigDetails.ts`)

## Environment variables

**Client-side (NEXT_PUBLIC_):**
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` — WalletConnect v2 (required)
- `NEXT_PUBLIC_ALCHEMY_API_KEY` / `NEXT_PUBLIC_INFURA_API_KEY` — optional RPC

**Server-side:**
- `DATABASE_URL` — Neon PostgreSQL connection string (required for API routes)
- `SESSION_SECRET` — HMAC secret for SIWE session cookies (falls back to legacy `PRIVATE_KEY` if set)
- `ETHERSCAN_API_KEY` — ABI fetching via `/api/getABI`
- `ALCHEMY_API_KEY` — token/NFT balances via `/api/get-assets` (falls back to `NEXT_PUBLIC_ALCHEMY_API_KEY`)
- `ADMIN_ADDRESSES` — comma-separated wallets allowed to view publicly shared address book entries on `/admin`
- `RESEND_API_KEY` / `RESEND_CONTACT_TO` — contact form via `/api/contact` (`RESEND_FROM` optional, defaults to Resend's onboarding sender); also powers owner email notifications (`src/lib/email/`, see `docs/email-notifications.md`)
- `SLACK_CLIENT_ID` / `SLACK_CLIENT_SECRET` / `SLACK_SIGNING_SECRET` / `SLACK_TOKEN_ENCRYPTION_KEY` — Slack app (`src/lib/slack/`); manifest and setup in `docs/slack-integration.md`. `SLACK_REDIRECT_URI` optional
- `CHANNLIZE_SERVER_API_KEY` / `CHANNLIZE_PROJECT_ID` — Channlize events via `@channlize/core` `createNotifier()` (`src/lib/channlize/`); both optional, events are skipped when unset

## Request Lifecycle

The `multisig_requests` table is the source of truth for queued requests. Mutations are split across dedicated endpoints with strict auth:

- **POST** `/api/multisig-requests` — `withVerifiedAs` (SIWE wallet matches body `submitter`); also enforces `allow_only_owner_request` when set.
- **PATCH / DELETE / POST .../reset / POST .../cancel** — `withVerifiedAsOwner` (the connected wallet must be on the wallet's owners list). Non-owner wallets get **403**.
- **POST .../cascade** — `withVerifiedAsOwner`; re-runs the cascade for a request that is already executed, cancelled or reset. The trigger is derived from the stored request (`triggerFromState`), never taken from the caller; a live request gets 409.

### Cascade invalidation

When a request is **reset**, **executed** (success or fail), or **manually cancelled**, other active requests in the same wallet have their signatures wiped and are marked `isActive=false, isCancelled=true, cancelledBy='cascade', dateCancelled=<ISO>`:

- **Executed / failed**: every other request. Execution moves the wallet nonce past the source's effective nonce, and on Extended wallets the pinned-nonce `execTransaction` consumes every nonce below a pinned one (`NonceTooLow`), so lower-pinned and unpinned requests can never run; higher-pinned ones are reset so owners re-confirm.
- **Reset / cancelled**: requests with a strictly greater *effective nonce* (see below); nothing changed on-chain.
 The cascade is **server-side** (single `UPDATE…RETURNING` in `src/lib/api/cascade.ts`) so every client picks it up on their next refresh — the old Zustand-only scan in `useExecTransaction.ts` was incomplete.

**Effective nonce** = `request.txnNonce` (pinned, Extended wallets) OR the wallet's current `nonce()` (unpinned). For an unpinned reset/cancel, the cascade invalidates `(txn_nonce IS NULL) OR (txn_nonce > wallet_nonce)` so all other live requests in the queue are wiped (issue #39 "auto reset all requests signatures if one request is reset or fail in queue"). UserOp requests are excluded — they use the EntryPoint nonce, not the wallet's.

### Manual cancel UX

`src/components/multiSigDetails/CancelRequestButton.tsx` renders a confirmation dialog gated on `(isOwner && !isExecuted && !isCancelled)`. The server enforces owner-only; non-owner wallets get 403 even if they bypass the UI.

### Queue ordering

`GET /api/multisig-requests?multiSigAddress=…` orders active rows by:

1. `request->>'mode' = 'userop'` ASC — UserOps to the end.
2. `is_cancelled` ASC — cancelled rows float to the bottom.
3. `txn_nonce` ASC NULLS LAST — pinned ascending; NULLS LAST keeps unpinned (effective nonce = wallet nonce) at the top. `txn_nonce` is TEXT, so ordering and the cascade compare it through `pinnedNonceNumeric()` (numeric cast); `POST` rejects a non-integer `txnNonce` with 400.
4. `date_submitted` ASC — submission-time tiebreaker.

The response envelope now includes `walletNonce: number | null` (LEFT JOIN on `multisig_wallets.nonce`) so the list view can draw a "Next" badge without a second round-trip.

## Never commit

- `.env`, `.env.local` or any file holding real keys, tokens, `SESSION_SECRET`, `DATABASE_URL` values or private keys.
- Build output: `.next`, `out`, `storybook-static`, `packages/*/dist`, `.netlify`, `node_modules`.
- `slack-manifest.rendered.json` (generated).
- Absolute paths under a home folder in docs or code.

## Known issues

- PWA (`next-pwa`) disabled due to `lru-cache` incompatibility with Next.js 16
- Ledger and Safe wallet connectors commented out in `Web3Provider.tsx`
- `src/constants/providers.ts` is legacy (no-op); transports configured inline in `Web3Provider.tsx`
- `yarn lint` runs `next build lint`, which is not a standalone linter; use `yarn build` or `npx eslint`.

## Next.js notes

This is Next.js 16 with the Pages Router and `--webpack`. APIs and conventions differ from older releases and from the App Router: do not add an `app/` directory, and check nextjs.org for the installed `next` version before using an API from memory.
