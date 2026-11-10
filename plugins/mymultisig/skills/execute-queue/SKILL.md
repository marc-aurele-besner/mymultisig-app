---
name: execute-queue
description: Execute MyMultiSig requests that have reached their signature threshold, in queue (nonce) order, from the agent's key. Use when the user asks to execute, run, send or "push through" approved multisig transactions.
---

# Execute the queue

Runs requests that are ready to execute, in queue order, using the `mymultisig` MCP tools. Execution is irreversible, and the agent's key pays the gas.

## Rules

- **Order matters.** Unpinned requests bind the wallet's current nonce, so only the first non-cancelled request in `list_requests` can succeed.
  - Executing it moves the nonce forward.
  - The server then invalidates, or "cascades", every later request; their signatures are wiped and the owners re-sign.
  - Tell the user this before executing anything other than a single request.
- **Never execute a request that isn't `readyToExecute`.** The tool refuses anyway.
- **Another owner must have approved.** `execute_request` refuses a request that only the agent has signed, so a human stays in the loop. Share the request link and ask a co-owner to sign it first. Don't suggest turning the guard off; that's the operator's decision.
- **User-op requests** (`mode` = `userop`) go through a bundler from the app, so skip them here.

## Steps

1. Call `list_requests` (chainId, wallet) and pick the first request that isn't cancelled.
2. Call `get_request` on it, and show:
   - the decoded summary;
   - the warnings;
   - the signatures as `validSignatures`/`threshold`.
3. Ask: "Execute this on <chain> now? This can't be undone." Continue only on an explicit yes.
4. Call `execute_request`. It simulates first, so a revert surfaces as a decoded error and no gas is spent.
5. Report the result:
   - `success: true`: the inner call ran.
   - `success: false`: the wallet transaction mined, but the inner call reverted (TxFailure), and the nonce was still consumed.
   - Include the explorer link (`links.tx`).
   - If `recorded` is false, the transaction still happened on-chain. Tell the user the app will update once an owner refreshes the request page.
6. If the user asked for the whole queue, call `list_requests` again. Later requests will usually need fresh signatures after the cascade. Report what's left rather than looping.
