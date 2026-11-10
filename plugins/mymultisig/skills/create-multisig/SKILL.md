---
name: create-multisig
description: Deploy a new MyMultiSig multi-signature wallet with chosen owners and threshold, optionally at a deterministic (same-on-every-chain) address. Use when the user wants to create, set up or deploy a multisig / shared wallet / treasury.
---

# Create a multisig

Deploys a wallet from the official MyMultiSig factory using the `mymultisig` MCP tools. The agent's key (`MYMULTISIG_PRIVATE_KEY`) sends the deployment transaction and pays the gas.

## 1. Gather and check the inputs

- **Chain**: confirm the network by name and id (`list_networks`). Default to a testnet such as Sepolia (11155111) unless the user explicitly asks for mainnet.
- **Name**: a short label, at most 64 characters.
- **Owners**: a list of addresses. Remove duplicates and reject anything that isn't a valid 0x address.
  - If the agent should co-sign, its own address must be on the list. `whoami` shows it under `signer`.
- **Threshold**: between 1 and the number of owners.
  - Push back on 1-of-N for shared funds.
  - Push back on N-of-N without a recovery plan: one lost key would freeze the wallet.
- **Type**:
  - `simple` (default): plain multisig.
  - `extended`: adds owner-only requests, ERC-4337, allowlists, spending limits and other policies.
  - `advanced`: an extended wallet created through the factory's advanced path.
- **Same address on several chains?** Then use a `salt` (bytes32), and call `predict_multisig_address` first to show the address in advance.

## 2. Confirm

Show a summary:
- chain;
- name;
- type;
- owners;
- threshold;
- the predicted address, if a salt is used;
- that the agent's address pays gas.

If the agent's own address is an owner, the threshold must be at least 2. `create_multisig` refuses a wallet the agent could run alone, so a human co-signs every transaction.

Wait for an explicit "yes".

## 3. Deploy

Call `create_multisig`. Then report:
- `address`;
- the explorer link (`links.tx`);
- the app link (`links.app`);
- whether `registered` is true.

If registration failed, the wallet still exists on-chain. Tell the user they can import it in the app at `/import-multisig`.

## 4. Verify

Call `get_multisig` on the new address. Confirm that the owners and threshold match what was requested.
