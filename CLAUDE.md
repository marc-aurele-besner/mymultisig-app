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
- API routes in `src/pages/api/` handle CRUD; request bodies are `{ action, data }`

## Key Patterns

### Transaction Hook Pattern
All contract writes follow the same flow:
1. Domain hook (e.g., `useCreateMultiSig`, `useExecTransaction`) builds wagmi config
2. Delegates to `useFinalizeTransaction` which wraps `useWriteContract` + `useWaitForTransactionReceipt`
3. `useFinalizeTransaction` manages toast notifications (info → success/error)
4. Domain hooks use `useWatchContractEvent` for on-chain events, then update Neon via API routes and Zustand state locally

### Data Flow for Mutations
1. User action triggers a wagmi write
2. On success event, hook calls `addContent`/`updateContent` with `{ action, data }` (→ `/api/add-content` or `/api/update-content/[id]`)
3. API route checks the SIWE session cookie before writing to Neon
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
