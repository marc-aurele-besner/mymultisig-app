# Contract deployment plan: testnet and mainnet

How to put the `mymultisig-contract` factory (v0.5.x) on testnets and mainnets without risking user funds or shipping an address we later have to abandon.

The contracts live in [marc-aurele-besner/mymultisig-contract](https://github.com/marc-aurele-besner/mymultisig-contract). The app reads factory addresses from that package's `contractsAddressDeployed.json` (`src/constants/multiSigFactory.ts`), so a deployment only counts once it ships in an npm release and the app bumps to it.

## 1. Where things stand (Nov 2026)

| Item | State |
| --- | --- |
| Live factories | Sepolia `0x2eE7e3532806cd6D7904ed8bD184665b0e3F95e2` (v0.5.0, Jul 17 2026). Goerli `0x2D25…7082` (v0.0.12; the chain is dead). No mainnet. |
| Deploy tooling | `scripts/deploy.ts` → `test/shared/setup.ts#setupContract(…, deployFactory=true)`. Hardhat 3, plain CREATE from the deployer EOA. |
| Factory shape | Three deployer contracts (`MyMultiSigDeployer`, `MyMultiSigExtendedDeployer`, `MyMultiSigAdvancedDeployer`) as constructor immutables, a `MyMultiSigFactory` implementation, behind `MockTransparentUpgradeableProxy` + `MockProxyAdmin`. |
| Wallets | Plain contracts, not proxies. Once deployed, a wallet's bytecode can never change. |
| Audit | None. The README labels the contract beta. |

### Problems in the current setup

Fix these before any mainnet deploy. All paths are in the contract repo.

1. **The `*Fork` networks are live networks.** In `hardhat.config.ts`, `ethereumFork`, `sepoliaFork`, `bnbFork`, `polygonFork`, … are `type: 'http'` against the real RPC with the real chain ID and real keys. `yarn deploy-ethereumFork` therefore deploys to Ethereum mainnet. A real fork in Hardhat 3 is `type: 'edr-simulated'` with `forking: { url }`.
2. **The factory proxy can't be upgraded, and nobody has noticed.** OpenZeppelin 5.x `TransparentUpgradeableProxy` creates its own `ProxyAdmin` in its constructor (`TransparentUpgradeableProxy.sol:80`) owned by the `initialOwner` argument. `setup.ts` passes the address of a separately deployed `MockProxyAdmin` as that owner. The real admin is therefore the nested `ProxyAdmin`, owned by a contract that can only call `upgradeToAndCall` on a proxy, never `upgradeAndCall` on a `ProxyAdmin`. The result is that no upgrade is possible. `scripts/upgradeFactory.ts` already says it cannot upgrade. We pay proxy gas and complexity for nothing.
3. **Cross-chain deterministic addresses aren't implemented.** `constants/extended.ts` defines `FACTORY_SALT` and `CANONICAL_CREATE2_DEPLOYER`, and the README promises "same wallet address on every chain". However, `deploy.ts` only *logs* those values and deploys with nonce-based CREATE. Addresses then depend on the deployer EOA's nonce, which is how the Sepolia Advanced deployer ended up at the same address as the old Goerli factory. (Small fix on the side: `0x4e59b448…956C` is Arachnid's deterministic deployment proxy, not an OpenZeppelin contract as the comment says.)
4. **Raw private keys in `.env`.** Three `PRIVATE_KEY_<NET>_0x` per network, read through `configVariable`. Nothing separates a testnet key from a mainnet key except the variable name.
5. **The script deploys from a working tree.** Nothing ties a deployment to a tagged commit, a clean tree, or a recorded compiler config. The address book entry does not store the commit.
6. **The in-app "deploy it yourself" artifacts are stale.** `src/constants/factoryDeployArtifacts.json` (used by `DeployFactoryModal`) says `evm london`, commit `d240b2f`, and has no `MyMultiSigAdvancedDeployer`. v0.5.0 compiles with `viaIR` and `cancun`. Community deployments made from the app would not match the published ABI or the canonical bytecode.
7. **Dead entries ship to users.** The Goerli factory is still in `contractsAddressDeployed.json`, and the app imports every entry.

## 2. Decisions to take first

| Decision | Recommendation | Why |
| --- | --- | --- |
| Upgradeable factory or immutable? | **Immutable. Drop the proxy for mainnet.** | The factory only holds bookkeeping, and wallets are standalone contracts. An upgrade key on mainnet is a single point of compromise: whoever holds it could swap in a factory that deploys malicious wallets. To fix a factory bug, deploy a new factory and list it in the app, as the Goerli→Sepolia move already did. If upgradeability is kept anyway, the admin must be a multisig (ideally a MyMultiSig wallet on that chain behind a timelock), and point 2 above must be fixed first. |
| Address scheme | **CREATE2 through `0x4e59b448…956C` with fixed salts** for the three deployers and the factory. | This gives the same factory address on every EVM chain. It makes `createDeterministic*` deliver the "same wallet on every chain" promise, lets anyone check a deployment by recomputing the address, and makes squatting impossible because bytecode and salt fix the address. Confirm the proxy contract exists on each target chain first (it does on all mainstream EVM chains). |
| Deployer key | A **fresh hardware-wallet account used only for deployments**, funded just before each run, with a different account per environment (testnet/mainnet). | With CREATE2 the deployer no longer controls the address and, without a proxy, holds no privilege after deploy. Leaking it costs only the gas float. Never reuse the 2023 deployer `0x45C3…eCcc` for mainnet. |
| Which mainnets first | One cheap L2 canary first (Base or Arbitrum), then Ethereum, then the rest of `src/constants/networks.ts` that have demand. | Real conditions with real money at low cost, so problems show up there before Ethereum. |
| Release gate | **No mainnet before an external audit** (or at least a paid competitive review) of v0.5.x. | v0.5.0 added DELEGATECALL, ERC-4337, modules, timelock and guards in one release. That is the riskiest surface the contract has ever had, and wallets can't be patched after deploy. |

## 3. Pre-deploy gates (once per release)

Run all of these against the **exact commit** that will be deployed.

1. **Freeze**: tag `vX.Y.Z` on `main`, clean tree, lockfile installed with `--frozen-lockfile`.
2. **Tests**: `yarn test` (Hardhat + Foundry) green, plus coverage report reviewed for the new v0.5 paths (operation byte, `validateUserOp`, modules, timelock).
3. **Static analysis**: Slither (and optionally Aderyn) with no unresolved high/medium findings; triage file committed.
4. **Fuzz/invariants**: Foundry invariant tests for: threshold always ≤ owner count, nonce strictly increases on `execTransaction`, no call with a non-zero `operation` other than `delegatecall` to self, modules can't bypass guard.
5. **Size + config**: every contract under EIP-170 (24,576 bytes) with `viaIR`, `cancun`, `runs: 200`. Record solc version + settings + metadata hash.
6. **Audit sign-off** (mainnet only): report published, all findings fixed or explicitly accepted, re-run of gates 2–5 on the fixed commit.
7. **App compatibility**: the app on a branch with the new package passes `yarn build`, and the signer and SDK (`packages/sdk`) produce signatures the new wallet accepts. This is an end-to-end test against a local fork; see phase 1.

## 4. Script changes (contract repo)

Write a dedicated `scripts/deployProduction.ts` (keep `deploy.ts` for local dev) that:

- refuses to run unless the git tree is clean and `HEAD` carries a release tag;
- refuses any network whose name ends in `Fork` but is `type: 'http'`, and fixes the config so `*Fork` really forks (point 1);
- deploys `MyMultiSigDeployer`, `MyMultiSigExtendedDeployer`, `MyMultiSigAdvancedDeployer` and the factory through the CREATE2 proxy with fixed salts, with no proxy and no `initialize` (decision 1);
- **predicts every address before sending anything** and prints them for confirmation, then checks after deploy that on-chain code hash == artifact runtime hash and the factory's immutables point at the expected deployers;
- is idempotent: if code already exists at the predicted address it verifies instead of deploying (re-running after a failure is safe);
- runs a smoke test: create one simple and one extended wallet with a throwaway owner set, sign and execute one 0-value tx on each, and check `version()` and the factory counters;
- verifies source on the explorer (`hardhat-verify`) and on Sourcify;
- writes the address book entry with `commit`, `tag`, `solc`, `codeHash`, deployer addresses and block number;
- supports `--dry-run` against a local fork of the target chain (same script, same salts, so it predicts the same addresses).

Signing: use a hardware wallet through Frame or a Ledger signer, not a `.env` key, for anything except local and testnet.

## 5. Rollout

### Phase 0: local fork rehearsal (every chain, every time)

- `anvil --fork-url <rpc>` (or a Hardhat `edr-simulated` fork) of the target chain.
- Run `deployProduction.ts --dry-run`. The addresses must match the predicted ones, and the smoke test and code-hash checks must pass.
- Point a local app (`yarn dev` on the fork's chain ID) at the fork and walk through create → propose → sign by two owners → execute, plus one UserOp through EntryPoint v0.7 (`0x0000000071727De22E5E9d8BDe0dFeC0CEB6a7d7`).

### Phase 1: testnets

1. Redeploy Sepolia with the new CREATE2 scheme, and keep the old v0.5.0 Sepolia factory listed (as legacy) so existing test wallets still show up.
2. Add Base Sepolia, Arbitrum Sepolia, Polygon Amoy and BNB testnet, the testnets of the planned mainnets. Each one should land on the same factory address, which also checks that the CREATE2 scheme works.
3. Publish a prerelease package (`mymultisig-contract@X.Y.Z-rc.N`) and point a preview build of the app at it.
4. **Soak for at least 2 weeks**: run the app's own end-to-end flows daily, invite a few external testers, and run the agent flows (`packages/mcp`, `packages/cli`) against it.
5. Remove the Goerli entry from the address book, and remove dead testnets (`goerli`, `polygonMumbai`, `optimismGoerli`, `arbitrumGoerli`) from `src/constants/networks.ts`.
6. Exit criteria: no contract change needed during the soak, audit done, all gates green on the final tag. **Any contract change resets the soak.**

### Phase 2: mainnet canary

1. Deploy to one L2 (Base or Arbitrum) from the audited tag using the same script, hardware-signed.
2. Run the smoke test with a 2-of-3 wallet owned by the team, then use it for real small amounts for 1–2 weeks.
3. Release `mymultisig-contract@X.Y.Z` with that chain only, and bump the app.
4. Turn on the app's guardrails for mainnet: keep the "beta, use at your own risk" disclaimer in `ConnectWallet`, and consider a soft cap warning on value sent from new wallets during the canary.
5. Set up monitoring before announcing:
   - alert on any `TxFailure` / `TxFailureOp` / `GuardReverted` spike;
   - alert on `ModuleEnabled` and delegatecall-op executions (rare, high-risk);
   - watch factory creation counts.

   Channlize or a Tenderly/OpenZeppelin Monitor alert both work.

### Phase 3: Ethereum and the remaining mainnets

- Same script, same tag, one chain at a time, with each address book entry reviewed in a PR on the contract repo before release.
- Ethereum: deploy when gas is low and send through a private RPC (e.g. Flashbots Protect) so the predicted addresses can't be front-run. With CREATE2 a front-runner could only deploy *our* bytecode at our address, which is harmless, but the private RPC keeps the run clean.
- After each chain, verify the source on the explorer, add the chain to the npm release, and bump the app.
- Regenerate `src/constants/factoryDeployArtifacts.json` from the same tag (bytecode for all four contracts, `cancun`, `viaIR`, real commit). Switch `DeployFactoryModal` to the CREATE2 path too, so a community deployment on a new chain lands on the canonical address and needs no registry trust.

## 6. Incident response

Wallets are immutable, so a fix always means "deploy new, migrate", never "patch".

| Situation | Response |
| --- | --- |
| Factory bug, wallets fine | Deploy a fixed factory (new salt or version), mark the old one `legacy` in the address book so the app stops offering it for creation but still reads its wallets. |
| Wallet bug, not exploitable without owner signatures | Disclose, ship a fixed version, and add an in-app banner on affected wallets with a guided "create new wallet + batch-move assets" flow. The request builder's batch template already covers the transfers. |
| Wallet bug, exploitable now | Disable creation in the app immediately, then contact owners through the notification channels already built (email, Slack, Discord, Telegram) to move funds. Publish an advisory with the affected `version()` and factory addresses. Ask whitehat groups (e.g. SEAL 911) for help with any active exploit. |
| Deployer key leaked | With an immutable CREATE2 factory there is no privileged role, so only the gas float is lost. Rotate the key for future runs. |

Write `SECURITY.md` contact details and a disclosure policy into the contract repo before mainnet. The app repo already has one.

## 7. Per-chain runbook (copy into the release PR)

- [ ] Tag `vX.Y.Z` checked out, clean tree, frozen install
- [ ] Gates 1–7 green (links to CI run, Slither triage, audit report)
- [ ] CREATE2 proxy present on the chain; predicted addresses recorded
- [ ] Dry run on a local fork: addresses match, smoke test passes
- [ ] Deployer funded with a known budget; hardware wallet connected
- [ ] Deploy, then code hash matches, immutables correct, smoke test passes on-chain
- [ ] Source verified on explorer + Sourcify
- [ ] Address book entry (commit, tag, solc, codeHash, block) in a reviewed PR
- [ ] npm release published (`npm publish --otp`, run by the maintainer)
- [ ] App bumped, `yarn build` green, chain enabled in `src/constants/networks.ts`
- [ ] Monitoring alerts live for the new factory
- [ ] Deployer drained back to cold storage
