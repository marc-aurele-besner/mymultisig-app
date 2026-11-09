---
name: review-and-sign
description: Review a queued MyMultiSig request — decode what it does, verify existing signatures, flag risks — and sign it with the agent's owner key only after explicit user confirmation. Use when the user asks to check, review, approve or sign a multisig request or shares a mymultisig.app/request/<id> link.
---

# Review and sign a request

Signing is a security decision. This skill makes the review explicit and never signs without a clear "yes" from the user.

## 1. Load the request

The request id is the UUID in `https://mymultisig.app/request/<id>`. You also need the chain id; ask for it if it isn't known.

Call `get_request` (chainId, requestId).

## 2. Review

Present the result to the user:

- **What it does**: `decoded.summary`. For contract calls, name the target contract when you can identify it.
- **Value**: native value in ether units.
- **Warnings**: list every entry in `decoded.warnings`. Treat each of these as high risk, needing a second look:
  - `DELEGATECALL`;
  - owner or threshold changes;
  - unlimited approvals;
  - calls to unverified or unknown contracts;
  - recipients that aren't in the user's address book.
- **Signatures**: `validSignatures` / `threshold`. Flag any signature whose status is not `valid`:
  - `mismatch` means the signature was tampered with or signed a different payload;
  - `not-owner` means the signer isn't on the owner list;
  - `unverifiable` means a nested-wallet (EIP-1271) signature that only the on-chain check can judge.
- **State**: already executed or cancelled? Already signed by the agent (`signedByMe`)?
- **Expiry**: if `request.request.validUntil` is non-zero, show it as a date.

If the purpose is unclear, say so, and suggest asking the submitter before signing.

## 3. Confirm, then sign

Ask: "Sign this request as <agent signer address>?"

- Only on an explicit yes, call `approve_request`.
- The tool refuses when any existing signature is invalid. In that case, suggest `reset_request`, but only after the owners agree.

## 4. Report

Report the new `validSignatures` / `threshold`. If `readyToExecute` is now true, say so and offer the `execute-queue` skill.
