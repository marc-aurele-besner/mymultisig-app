# PRD: Full Smart-Contract Feature Parity in mymultisig.app

| Field                    | Value                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Product                  | mymultisig-app                                                                                                    |
| Contract source of truth | [marc-aurele-besner/mymultisig-contract](https://github.com/marc-aurele-besner/mymultisig-contract) `main`        |
| App package today        | `mymultisig-contract@0.1.0` (ABI lagging behind GitHub)                                                           |
| Goal                     | Expose every user-facing capability of `MyMultiSig`, `MyMultiSigExtended`, and `MyMultiSigFactory` in the web app |
| Non-goal                 | Rebuilding the contracts; Slack/Discord bots; Safe connector UX                                                   |

## 1. Problem

The app covers the happy path for a simple wallet: factory `createMultiSig` → off-chain EIP-712 collect → `execTransaction`. The contract surface is much larger:

- Extended wallets (`createMyMultiSigExtended`) with inactivity delegation, nonce invalidation, owner-only request policy, and explicit nonce execution
- Safe-style on-chain approvals (`approveHash`, `getApprovedOwners`)
- Batched calls with per-call audit (`multiRequest` + `MultiRequestExecuted`)
- Factory discovery (enumerate wallets by creator / index / type)
- Dedicated admin UX (owners/threshold today only via generic "call self")

Until the app ships these, contract features exist but are effectively unused.

## 2. Current state (gap summary)

| Area                      | Contract                                                 | App today                                              |
| ------------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| Create simple multisig    | `createMultiSig`                                         | Supported                                              |
| Create extended multisig  | `createMyMultiSigExtended`                               | Not supported                                          |
| Factory bookkeeping       | `multiSig*`, `creationType`                              | Hook unused / no UI                                    |
| Sign (EIP-712)            | Off-chain                                                | Supported                                              |
| On-chain approve          | `approveHash`                                            | Not supported                                          |
| Execute                   | `execTransaction`                                        | Supported (simple signature)                           |
| Execute w/ explicit nonce | Extended overload                                        | Not supported                                          |
| Admin (owners/threshold)  | `add/remove/replaceOwner`, `changeThreshold`             | Indirect only                                          |
| Batch                     | `multiRequest` + results event                           | Indirect only; no results UI                           |
| Extended governance       | Delegation, takeover, nonce burn, owner-only requests    | Not supported                                          |
| Preflight                 | `generateHash`, `isValidSignature`                       | Not used                                               |
| Events                    | incl. `ApproveHash`, `MultiRequestExecuted`, `TxFailure` | Partial (`TransactionExecuted`/`Failed`; EOL log-only) |

## 3. Prerequisites (blocking)

### P0.1 — Publish & bump contract package

- Publish a new npm version from current `main` (ABI + types + addresses).
- App: bump `mymultisig-contract`, regenerate local flattened verify source if needed.
- Treat ABI drift as a release gate (CI check that app ABI matches package).

### P0.2 — Detect wallet variant

- On import / after create: determine Simple vs Extended (e.g. `creationType` from factory, or probe `allowOnlyOwnerRequest()` / bytecode).
- Persist `walletType: 'simple' | 'extended'` in Neon + Zustand.
- Route Extended-only UI behind that flag.

### P0.3 — Owner list source of truth

Contract stores owners as a mapping — no `getOwners()`.

- Prefer: Neon stores `owners[]` at create/import; refresh from `OwnerAdded` / `OwnerRemoved` / `replaceOwner` events after admin txs.
- Fallback: require owners at import time (already partially true).

### P0.4 — Breaking ABI awareness

Recent contract changes the app must absorb:

- `TransactionFailed` → `TxFailure` (verify exact event name on published ABI)
- `multiRequest` returns `(bool[] successes, bytes[] returnData)` + `MultiRequestExecuted`
- `approveHash` / `getApprovedOwners` / `getThreshold(bytes32)`
- Factory `MyMultiSigCreated` includes threshold
- Factory uses external deployers (size-safe); community deploy flow must deploy deployers + factory, not the old monolithic bytecode

## 4. Product requirements by epic

### Epic A — Factory & wallet creation

**A1. Create Simple Multisig (harden existing)**

- Inputs: name, `owners[]`, threshold
- Call `createMultiSig`
- On `MyMultiSigCreated`: persist address, name, owners, threshold from event, chainId, `walletType: simple`
- Fix known bugs: hardcoded `threshold: 2`, wrong `ownerCount`, Goerli-only explorer links

**A2. Create Extended Multisig (new)**

- Same as A1 + toggle "Only owners can create requests" → `isOnlyOwnerRequest`
- Call `createMyMultiSigExtended(..., isOnlyOwnerRequest)`
- Persist `walletType: extended` + `allowOnlyOwnerRequest`

**A3. Factory discovery**

- "Wallets I created": `multiSigCreatorCount(me)` + `multiSigByCreator(me, i)` + `creationType(i)`
- Optional global index via `multiSigCount` / `multiSig(i)`
- One-click import into local list

**A4. Community factory deploy**

- Update `DeployFactoryModal` / `useDeployFactory` for deployers + factory (not oversized single artifact)
- Persist new factory address per chain in Zustand

**Acceptance**

- User can create Simple or Extended on a supported chain
- Post-create metadata matches on-chain reads
- User can list factory-created wallets for their address

### Epic B — Core transaction lifecycle (Simple + Extended)

**B1. Build request (harden)**

- ETH transfer path must allow Sign without requiring contract/function selection
- Contract call path unchanged (ABI encode via `useCallData`)
- Capture: `to`, `value`, `data`, `gas`, `nonce` (current on-chain nonce by default)

**B2. Off-chain EIP-712 signing (existing)**

- Keep Neon request sharing + multi-owner signature collection
- Preflight: call `generateHash` + optionally `isValidSignature` before execute
- Show signature progress vs threshold

**B3. Safe-style approveHash (new — high value)**

- On request detail: Approve on-chain → `approveHash(txHash)`
- Watch `ApproveHash`; refresh `getApprovedOwners(hash)`
- Progress UI: on-chain approvals + off-chain ECDSA sigs (deduped; contract already prevents double-count)
- Execute with remaining ECDSA sigs when approvals + sigs >= threshold
- Idempotent UX: second approve is no-op

**B4. Execute**

- `execTransaction(to, value, data, gas, signatures)`
- Handle success + failure events (`TransactionExecuted` / `TxFailure`)
- Surface clear toast + request status in Neon

**B5. ContractEndOfLife**

- When nonce nears limit: banner on wallet home ("wallet approaching end of life; migrate")

**Acceptance**

- Owner can approve via wallet signature or `approveHash`
- Mixed path reaches threshold and executes
- Failed inner call shows failure state, not silent success

### Epic C — Dedicated admin / settings (onlyThis ops)

Today these require building a self-call request. Ship first-class flows that still go through the normal sign → execute pipeline (they must be multisig txs).

| Feature           | Contract          | UX                                                    |
| ----------------- | ----------------- | ----------------------------------------------------- |
| Add owner         | `addOwner`        | Form + confirmation of new threshold implications     |
| Remove owner      | `removeOwner`     | Block if would break threshold                        |
| Replace owner     | `replaceOwner`    | Old → new                                             |
| Change threshold  | `changeThreshold` | Validate 1 ≤ threshold ≤ ownerCount                   |
| Skip / bump nonce | `incrementNonce`  | Danger zone: invalidate pending requests at old nonce |

Also:

- Watch `OwnerAdded` / `OwnerRemoved` / `ThresholdChanged` and sync Neon/Zustand
- After admin execute, invalidate related pending requests if nonce/owners changed

**Acceptance**

- Non-technical owner can change owners/threshold without picking ABI functions
- On-chain state and app state stay in sync after execution

### Epic D — Batched multiRequest

**D1. Batch request builder**

- UI to add N steps: `{ to, value, data, gas }[]`
- Encode as single self-call to `multiRequest(address[],uint256[],bytes[],uint256[])`
- Sign/execute as one multisig transaction

**D2. Per-call results**

- On success of outer tx, parse `MultiRequestExecuted(txNonce, successes[], returnData[])`
- Show per-step success/fail + decoded revert data when possible
- Explicit copy: partial failure is allowed; outer tx can still succeed

**Acceptance**

- User can run payroll-style batch and see which legs failed
- Simulation (optional later): `eth_call` before signing

### Epic E — MyMultiSigExtended-only features

Gate all of this behind `walletType === 'extended'`.

**E1. Owner-only request policy**

- Read `allowOnlyOwnerRequest()`
- Settings request: `setOnlyOwnerRequest(bool)`
- If true: non-owners cannot create Neon requests (UI + API guard)

**E2. Explicit-nonce execution**

- Extended overload: `execTransaction(to, value, data, gas, txnNonce, signatures)`
- Request builder: optional "use nonce N" (future / reserved nonce)
- Show `isNonceUsed(n)`

**E3. Invalidate nonce**

- Admin request: `markNonceAsUsed(nonce)`
- UX: "Burn this nonce / cancel all pending txs bound to it"

**E4. Inactivity minimum**

- Read `minimumTransferInactiveOwnershipAfter`
- Admin: `setTransferInactiveOwnershipAfter(uint256)` (≥ 7 days)

**E5. Delegation & takeover**

- Per-owner panel from `ownerSettings(owner)` → `{ lastAction, transferInactiveOwnershipAfter, delegate }`
- Admin request: `setOwnerSettings(owner, transferInactiveOwnershipAfter, delegatee)`
- Take over CTA for connected delegatee when inactive: direct `takeOverOwnership(owner)` (not via `execTransaction`)
- Show countdown until takeover / "available now"

**Acceptance**

- Extended wallet can configure policy, delegation, and nonce burn end-to-end
- Delegate takeover works without other owners once inactivity window elapsed
- Simple wallets never show Extended controls

### Epic F — Reads, safety, and polish

- Expand `useMultiSigDetails` for Extended fields + approval state
- Use `isValidSignature` before enabling Execute
- Decode custom errors (`NotOwner`, `InvalidSignatures`, `NonceAlreadyUsed`, …) in toasts
- Fix ETH-transfer sign gating
- Chain-aware explorers; multi-chain factory addresses when published
- Stories for new components; keep existing hook → `useFinalizeTransaction` pattern

## 5. Suggested UX information architecture

```
Wallet home
├── Overview (name, type, threshold, nonce, balance, EOL warning)
├── Owners & settings
│   ├── Owner list + admin actions (→ request pipeline)
│   └── Extended: policy, inactivity, delegation, takeover
├── New request
│   ├── Send ETH
│   ├── Call contract
│   └── Batch (multiRequest)
└── Requests
    └── Request detail
        ├── Approve on-chain (approveHash)
        ├── Progress (approvals + sigs / threshold)
        └── Execute (+ per-call batch results)
```

Create flow: Simple | Extended tabs/toggle on create page.

## 6. Data model changes

**Neon / Zustand multisig**

- `walletType: 'simple' | 'extended'`
- `allowOnlyOwnerRequest?: boolean`
- `owners: address[]` (required, event-synced)
- `creationIndex?`, `factoryAddress`

**Transaction request**

- `txHash` (EIP-712 digest)
- `onChainApprovals: address[]` (or refetch live)
- `signatures: …` (existing)
- `txnNonce` (especially Extended)
- `batchSteps?` + `batchResults?` after execute
- `mode?: 'standard' | 'userop'` (ERC-4337 path; standard requests stay implicit)
- `userOpHash?`, `userOpSigningHash?`, `userOpJson?`, `userOpReceipt?` (live PackedUserOperation + receipt when the request is dispatched through a bundler)
- `bundlerUrl?`, `paymasterUrl?` (captured per request so a second owner can verify the same target)

## 7. Phased delivery

| Phase | Scope                                                                            | Outcome                       |
| ----- | -------------------------------------------------------------------------------- | ----------------------------- |
| 0     | Package bump, wallet-type detection, owner sync, event rename, factory deployers | App speaks current contract   |
| 1     | Extended create + factory discovery + admin settings UI + ETH sign fix           | Parity on create/admin        |
| 2     | `approveHash` hybrid approval + preflight `isValidSignature`                     | Safe-style UX                 |
| 3     | `multiRequest` builder + results                                                 | Batch payroll / distributions |
| 4     | Extended: policy, nonce burn, explicit nonce, takeover, EOL UX                   | Full Extended surface         |
| 5     | Multi-chain factories, better verify, error decoding                             | Production hardening          |
| 6     | ERC-4337 UserOp path: build, sign, send-to-bundler, paymaster                   | Account-abstraction parity    |

## 8. Out of scope (for this PRD)

- Replacing Neon off-chain requests entirely with on-chain-only approvals (hybrid is the target)
- Automatic owner enumeration without events/DB (impossible on-chain today)
- Smart-contract audits / redeploy strategy (ops decision; app should support both old Goerli factory and new addresses)

## 9. Success metrics

- 100% of public non-view mutators have a dedicated or documented in-app path
- Extended create used in ≥ X% of new wallets (once shipped)
- ≥ 1 successful hybrid execute (`approveHash` + ECDSA) in staging
- Batch request shows correct per-leg success/fail in UI
- Zero reliance on outdated 0.1.0 ABI in production
- ≥ 1 successful UserOp end-to-end (off-chain signature + bundler receipt) in staging on Sepolia

## 10. Open decisions

- **Default create type**: Simple vs Extended?
- **Approval default**: keep off-chain-first, or push `approveHash` as primary for hardware wallets?
- **Redeploy**: keep supporting old Goerli factory version, or migrate users to a new factory version?
- **Package**: publish npm from GitHub `main` before Phase 0, or pin app to git dependency temporarily?

## 11. Account Abstraction (ERC-4337) — Epic G

The 0.5.0 Extended wallet is a real ERC-4337 v0.7 IAccount: it exposes `validateUserOp`, `userOpSigningHash`, and an EntryPoint-only `execute(to, value, data)`. The wallet's transaction nonce is **not** used on this path — replay protection lives in the EntryPoint's 2D nonce. The owner signature format is the same `(owner, sig)[]` blob the classic `execTransaction` consumes, but the digest is `userOpSigningHash(userOpHash)` (= `EIP191(userOpHash)`) instead of an EIP-712 transaction hash.

**G1. Build**

- UserOp builder: packs `accountGasLimits` and `gasFees` into the two bytes32 fields and fills `callData = wallet.execute(to, value, data)`.
- Default gas fields are conservative Sepolia-friendly values; the bundler's `eth_estimateUserOperationGas` refines them at submit time.
- EntryPoint nonce is read from `getNonce(sender, 192)` and refreshed on the bundler receipt.

**G2. Sign (off-chain ECDSA)**

- Toggle on the build-request form: "Submit via bundler (ERC-4337)".
- When enabled, the EIP-712-only fields (validUntil, operation, pinned nonce, batch) are hidden and the callData is bound to `execute(to, value, data)` instead of `multiRequest` / `execTransaction`.
- Each owner signs the *inner* `userOpHash` via `personal_sign`; the signature is over `EIP191(userOpHash) = userOpSigningHash`, which is what `_checkSignatures` recovers from in `validateUserOp`.
- Votes accumulate in the request's `signatures` / `ownerSigners` arrays using the same `(owner, sig)[]` packed encoding the classic path uses.

**G3. Approve on-chain**

- Owners can call `wallet.approveHash(userOpSigningHash(userOpHash))` to count toward the threshold without producing an off-chain signature. Idempotent per (owner, hash).
- The detail view reads `getApprovedOwners(userOpSigningHash)` and counts it alongside off-chain ECDSA signatures (the contract prevents double votes).

**G4. Send to bundler**

- Configurable bundler URL: per-chain env var `NEXT_PUBLIC_BUNDLER_URL_<chainId>` with a global `NEXT_PUBLIC_BUNDLER_URL` fallback; per-chain override via the AccountAbstractionPanel (stored in localStorage).
- On threshold, the detail view shows a Send-to-bundler CTA. The hook calls `pm_getPaymasterData` (if a paymaster URL is configured), `eth_estimateUserOperationGas`, `eth_sendUserOperation`, then polls `eth_getUserOperationReceipt` until `success` is set.
- The bundled tx hash is shown with the chain's explorer link.

**G5. Paymaster**

- Optional per-chain paymaster URL (`NEXT_PUBLIC_PAYMASTER_URL_<chainId>` / `NEXT_PUBLIC_PAYMASTER_URL`). The paymaster endpoint answers `pm_getPaymasterData`; the result is used verbatim for `paymasterAndData`, callGasLimit, and verificationGasLimit (Pimlico contract).
- Sponsor signing is out of scope for v1.

**G6. EntryPoint deposit**

- Anyone can prefund via `EntryPoint.depositTo(wallet)` (existing).
- Owner can withdraw via `EntryPoint.withdrawTo(recipient, amount)` from the panel.

**G7. Storage**

- The same `multisig_requests` table holds UserOp requests; the request JSONB carries `mode: 'userop'`, `userOpHash`, `userOpSigningHash`, `userOpJson`, `userOpReceipt`, `bundlerUrl`, `paymasterUrl`, and `userOpGas`. No schema migration.

**Acceptance**

- An Extended wallet can build, sign, and dispatch a UserOp end-to-end.
- Hybrid votes (off-chain ECDSA + on-chain `approveHash`) reach the threshold and execute.
- A paymaster (when configured) sponsors gas; without one, the wallet's EntryPoint deposit is debited.
- The AccountAbstractionPanel surfaces the EntryPoint nonce, deposit, bundler URL, paymaster URL, and withdraw form.
- Zero regressions on the classic `execTransaction` path.

**Out of scope (v1)**

- Auto gas price oracle (viem `estimateFeesPerGas` or the bundler's estimator suffices).
- Multi-bundler failover.
- UserOp simulation / `eth_simulateUserOpAssetChanges`.
- Bundle traces from `debug_traceCall` against the EntryPoint.
- Sponsor-signed paymaster flows (verifying paymaster stubs, signed sponsorship blobs).
- `multiRequest` batch results on the UserOp path (the inner `execute(to, value, data)` only carries the URL-encoded `execute` call; per-step results would need a new wallet event).
