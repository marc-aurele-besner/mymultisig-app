# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev              # Next.js dev server
yarn netlify dev      # Dev with Netlify Functions proxy
yarn build            # Production build (next build --webpack)
yarn lint             # Lint via next build lint
yarn prettier         # Prettier format check
yarn storybook        # Component explorer on port 6006
yarn build-storybook  # Static Storybook build
yarn test-storybook   # Run Storybook tests
npx jest              # Run Jest tests (no yarn script wired)
yarn analyze          # Bundle analysis
```

Commit messages must follow **Conventional Commits** format (enforced by commitlint + husky).

## Architecture

**Next.js Pages Router** with React 19, TypeScript (strict mode), deployed on Netlify.

### UI Layer
- **shadcn/ui** with **Tailwind CSS v4**; theme via CSS variables in `src/styles/globals.css`; `next-themes` for dark mode.
- UI primitives in `src/components/ui/` (button, input, label, card, dialog, dropdown-menu, select, switch, textarea, sheet); `src/lib/utils.ts` provides `cn()` for class merging.
- **Icons**: `src/components/icons/ChakraIcons.tsx` re-exports lucide-react with a small wrapper (same API: `boxSize`, `className`).

### Web3
- **wagmi v3 + viem v2** for all on-chain reads/writes
- Wallet connectors configured in `src/components/web3/Web3Provider.tsx` (MetaMask, Coinbase, WalletConnect v2, Injected)
- Supported chains defined in `src/constants/networks.ts` (15 chains from `viem/chains`)
- Factory addresses and ABIs from the `mymultisig-contract` npm package
- `@ethersproject/abi` provides the `JsonFragment` ABI types (no ethers runtime dependency)

### State Management
- **Zustand v5** with `persist` middleware (localStorage)
- `src/states/contracts.ts` — user-added contracts store
- `src/states/multiSigs.ts` — multisig factories, deployed multisigs, selected address, transaction requests

### Backend / Data Persistence
- **Neon PostgreSQL** via `@neondatabase/serverless` for storing multisig wallets and transaction requests
- Schema in `src/lib/db/schema.sql`; client in `src/lib/db/neon.ts`
- Auth via SIWE session cookies (`src/lib/auth/siwe.ts`): writes require a valid session, and identity-claiming actions must match the session wallet (`isVerifiedAs`)
- API routes in `src/pages/api/` handle CRUD with one dedicated endpoint per action (e.g. `POST /api/multisig-requests`, `PATCH /api/multisig-requests/[id]`); per-endpoint auth is wrapped in `withSession` / `withVerifiedAs` from `src/lib/api/middleware.ts`. Public reads (`GET /api/multisig-requests`, `GET /api/multisig-requests/[id]`) skip the session guard so the detail view can render before sign-in.

## Key Patterns

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

## Environment Variables

**Client-side (NEXT_PUBLIC_):**
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` — WalletConnect v2 (required)
- `NEXT_PUBLIC_ALCHEMY_API_KEY` / `NEXT_PUBLIC_INFURA_API_KEY` — optional RPC

**Server-side:**
- `DATABASE_URL` — Neon PostgreSQL connection string (required for API routes)
- `SESSION_SECRET` — HMAC secret for SIWE session cookies (falls back to legacy `PRIVATE_KEY` if set)
- `ETHERSCAN_API_KEY` — ABI fetching via `/api/getABI`
- `ALCHEMY_API_KEY` — token/NFT balances via `/api/get-assets` (falls back to `NEXT_PUBLIC_ALCHEMY_API_KEY`)
- `ADMIN_ADDRESSES` — comma-separated wallets allowed to view publicly shared address book entries on `/admin`
- `RESEND_API_KEY` / `RESEND_CONTACT_TO` — contact form via `/api/contact` (`RESEND_FROM` optional, defaults to Resend's onboarding sender)

## Known Issues

- PWA (`next-pwa`) disabled due to `lru-cache` incompatibility with Next.js 16
- Ledger and Safe wallet connectors commented out in `Web3Provider.tsx`
- `src/constants/providers.ts` is legacy (no-op); transports configured inline in `Web3Provider.tsx`

## Request Lifecycle

The `multisig_requests` table is the source of truth for queued requests. Mutations are split across dedicated endpoints with strict auth:

- **POST** `/api/multisig-requests` — `withVerifiedAs` (SIWE wallet matches body `submitter`); also enforces `allow_only_owner_request` when set.
- **PATCH / DELETE / POST .../reset / POST .../cancel** — `withVerifiedAsOwner` (the connected wallet must be on the wallet's owners list). Non-owner wallets get **403**.
- **POST .../cascade** — `withSession` only (internal fan-out so other clients converge after a peer triggered a reset/execute/cancel).

### Cascade invalidation

When a request is **reset**, **executed** (success or fail), or **manually cancelled**, every other active request in the same wallet with a strictly greater *effective nonce* has its signatures wiped and is marked `isActive=false, isCancelled=true, cancelledBy='cascade', dateCancelled=<ISO>`. The cascade is **server-side** (single `UPDATE…RETURNING` in `src/lib/api/cascade.ts`) so every client picks it up on their next refresh — the old Zustand-only scan in `useExecTransaction.ts` was incomplete.

**Effective nonce** = `request.txnNonce` (pinned, Extended wallets) OR the wallet's current `nonce()` (unpinned). For unpinned source, the cascade invalidates `(txn_nonce IS NULL) OR (txn_nonce > wallet_nonce)` so all other live requests in the queue are wiped (issue #39 "auto reset all requests signatures if one request is reset or fail in queue"). UserOp requests are excluded — they use the EntryPoint nonce, not the wallet's.

### Manual cancel UX

`src/components/multiSigDetails/CancelRequestButton.tsx` renders a confirmation dialog gated on `(isOwner && !isExecuted && !isCancelled)`. The server enforces owner-only; non-owner wallets get 403 even if they bypass the UI.

### Queue ordering

`GET /api/multisig-requests?multiSigAddress=…` orders active rows by:

1. `request->>'mode' = 'userop'` ASC — UserOps to the end.
2. `is_cancelled` ASC — cancelled rows float to the bottom.
3. `txn_nonce` ASC NULLS LAST — pinned ascending; NULLS LAST keeps unpinned (effective nonce = wallet nonce) at the top.
4. `date_submitted` ASC — submission-time tiebreaker.

The response envelope now includes `walletNonce: number | null` (LEFT JOIN on `multisig_wallets.nonce`) so the list view can draw a "Next" badge without a second round-trip.

### Breaking changes (this PR)

- `withVerifiedAsOwner` replaces `withSession` on `PATCH`, `DELETE`, `/reset`, and `/cancel`. A signed-in wallet that is **not** an owner of the target multisig now gets **403** on any of those endpoints. Every existing in-app call site runs as the submitter (who is by definition an owner), so the practical blast radius is limited to shared-machine profiles that swap between owner wallets in one session.
- `POST /api/multisig-requests` now persists the client-supplied `id` UUID (validates it; 400 on garbage) and returns `{ content: { id } }`. Previously the response was only `{ message }` so the client UUID and the Neon UUID diverged.
