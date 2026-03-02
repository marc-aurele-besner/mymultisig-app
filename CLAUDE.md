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
- **Chakra UI v3** with custom theme in `src/styles/theme.ts` (dark mode default)
- Shared style objects (card, button, input variants) in `src/styles/colors.ts`
- **Webpack shim required**: `chakra-react-shim.mjs` fixes `@chakra-ui/icons` v2 compatibility with Chakra v3, applied via `NormalModuleReplacementPlugin` in `next.config.js`. Do not remove these shim files.

### Web3
- **wagmi v3 + viem v2** for all on-chain reads/writes
- Wallet connectors configured in `src/components/web3/Web3Provider.tsx` (MetaMask, Coinbase, WalletConnect v2, Injected)
- Supported chains defined in `src/constants/networks.ts` (15 chains from `viem/chains`)
- Factory addresses and ABIs from the `mymultisig-contract` npm package
- **ethers.js v5** used only in API routes for backend EIP-712 signing

### State Management
- **Zustand v5** with `persist` middleware (localStorage)
- `src/states/contracts.ts` — user-added contracts store
- `src/states/multiSigs.ts` — multisig factories, deployed multisigs, selected address, transaction requests

### Backend / Data Persistence
- **FaunaDB** via `faunadb-utility` for storing multisig wallets and transaction requests
- All writes verified with EIP-712 typed data signatures (server re-validates before writing)
- API routes in `src/pages/api/` handle CRUD + signature verification

## Key Patterns

### Transaction Hook Pattern
All contract writes follow the same flow:
1. Domain hook (e.g., `useCreateMultiSig`, `useExecTransaction`) builds wagmi config
2. Delegates to `useFinalizeTransaction` which wraps `useWriteContract` + `useWaitForTransactionReceipt`
3. `useFinalizeTransaction` manages toast notifications (info → success/error)
4. Domain hooks use `useWatchContractEvent` for on-chain events, then update FaunaDB via API routes and Zustand state locally

### Data Flow for Mutations
1. User action triggers a wagmi write
2. On success event, hook calls `signData` (client → `/api/signData`)
3. Signed data sent to `addContent`/`updateContent` (→ `/api/add-content` or `/api/update-content/[id]`)
4. API route re-validates signature server-side before writing to FaunaDB
5. Zustand store updated locally on API success

### Component Conventions
- Functional components with typed props interfaces
- Style props spread from `src/styles/colors.ts` (e.g., `{...buttonColors}`)
- Every component has a `.stories.tsx` file
- Use `useChainId()` + `useChains()` for chain/network context
- Use `useReadContracts` for batched multicall reads (see `useMultiSigDetails.ts`)

## Environment Variables

**Client-side (NEXT_PUBLIC_):**
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` — WalletConnect v2 (required)
- `NEXT_PUBLIC_ALCHEMY_API_KEY` / `NEXT_PUBLIC_INFURA_API_KEY` — optional RPC

**Server-side:**
- `FAUNADB_SERVER_SECRET` — FaunaDB secret (required for API routes)
- `PRIVATE_KEY` — Backend EVM wallet for signing (do NOT fund)
- `RPC_ETHEREUM` — Ethereum RPC for backend signer
- `ETHERSCAN_API_KEY` — ABI fetching via `/api/getABI`

## Known Issues

- PWA (`next-pwa`) disabled due to `lru-cache` incompatibility with Next.js 16
- Ledger and Safe wallet connectors commented out in `Web3Provider.tsx`
- `src/constants/providers.ts` is legacy (no-op); transports configured inline in `Web3Provider.tsx`
