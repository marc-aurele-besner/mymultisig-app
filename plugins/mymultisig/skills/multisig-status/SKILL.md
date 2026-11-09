---
name: multisig-status
description: Summarize a MyMultiSig wallet — owners, threshold, balances and the pending request queue with what each request needs next. Use when the user asks about the state of their multisig, what is waiting for signatures, or "what's in the queue".
---

# Multisig status

Give a one-screen picture of a MyMultiSig wallet using the `mymultisig` MCP tools.

## Inputs

- **Chain id** and **wallet address**. If either is missing, call `list_my_multisigs`. If that needs credentials the user doesn't have, ask for them. Use `list_networks` to map a network name ("Sepolia") to its id.

## Steps

1. `get_multisig` (chainId, address). Note the name, version, wallet type, owners, threshold and nonce, and whether `agentIsOwner` is true.
2. `get_balances` (chainId, address). Report the native balance in ether units (`nativeWei` / 1e18) and any ERC-20 balances with their symbols.
3. `list_requests` (chainId, address). For each request, in queue order, show:
   - the one-line `summary`;
   - signatures as `signatureCount/threshold`;
   - its state:
     - **ready**: signatureCount ≥ threshold;
     - **needs N more**;
     - **cancelled**;
     - **user-op** (`mode` = `userop`).
   
   The first non-cancelled request is the one that executes next.
4. If a request looks unusual (self-call, delegatecall, large value), call `get_request` for it and include its `warnings`.

## Output

A short report:

- Header: name, address, chain, version, `threshold`-of-`owners`.
- Balances.
- A queue table: #, description, summary, signatures, state, link.
- "Next action": exactly one suggestion, for example:
  - "Request 2 needs 1 more signature — share <link> with the other owners";
  - "Request 1 is ready — say *execute it* to run it".

Never approve or execute from this skill. Hand off to `review-and-sign` or `execute-queue`.
