---
name: propose-transaction
description: Queue a transaction on a MyMultiSig wallet — send native tokens, transfer or approve ERC-20s, call any contract, or change owners/threshold — then share the request link for co-signers. Use when the user wants the multisig to pay, send, transfer, call or change something.
---

# Propose a multisig transaction

Builds a request, sanity-checks it, queues it on mymultisig.app and shares the link with the co-signers. Uses the `mymultisig` MCP tools.

## If the MyMultiSig tools aren't available

The tools come from the `mymultisig-mcp` server. The `mymultisig` plugin bundles it. With the skills-only plugin, the user adds the server once, from their own terminal:

```
claude mcp add mymultisig -- npx -y mymultisig-mcp@0.1.3
```

Don't run this yourself. Show it to the user and point them to https://mymultisig.app/docs/ai-agents for the optional API key, agent key and read-only setting.

## 1. Build the call

- **Native transfer**: set `to` to the recipient and `valueEther` to the amount, for example `"0.1"`. Leave `data` empty.
- **ERC-20 transfer**: set `to` to the token contract, `abi` to `"function transfer(address to, uint256 amount)"`, `functionName` to `transfer`, and `args` to `[recipient, amountInBaseUnits]`.
  - Look up the token's decimals before converting the amount; never assume 18.
- **Any other contract call**: pass `abi` (a JSON ABI string or human-readable signatures), `functionName` and `args`. Call `encode_function_call` first if you want to preview the encoding.
- **Wallet settings**, such as `addOwner`, `removeOwner` or `changeThreshold`: these are self-calls, so `to` is the multisig address itself. Example ABI: `"function addOwner(address owner)"`.

## 2. Sanity-check before queueing

- Call `get_multisig` to confirm the chain and wallet, and that the wallet holds enough balance for `value`.
- Re-read the recipient address back to the user. Ask them to confirm addresses that came from chat rather than from their address book.
- Ask for explicit confirmation if any of these apply:
  - the value is large;
  - the call is an unlimited approval;
  - it changes owners or the threshold;
  - it uses `delegatecall`.
- Write a `description` the other owners will understand, for example "Pay Acme invoice #42 (1,200 USDC)".

## 3. Queue

Call `propose_transaction`.
- With a signing key, the agent's approval is attached automatically.
- With `sign: false`, or with no key, the request is queued unsigned for the humans to sign.

## 4. Report

Tell the user:
- the request `link`;
- `signatureCount` / `threshold`;
- who still needs to sign;
- the `decoded.summary` and any `warnings`.

Suggest sharing the link in the team channel.
