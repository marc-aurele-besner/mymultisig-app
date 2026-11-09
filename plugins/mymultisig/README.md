# MyMultiSig plugin for Claude Code

This plugin lets Claude create, inspect, propose, review, sign and execute [MyMultiSig](https://mymultisig.app) multi-signature wallet transactions.

## Install

```
/plugin marketplace add marc-aurele-besner/mymultisig-app
/plugin install mymultisig@mymultisig
```

## Configure

Set these environment variables before starting Claude Code. All of them are optional, but they control what the agent can do.

| Variable | Purpose |
|---|---|
| `MYMULTISIG_API_KEY` | `mms_…` key from https://mymultisig.app/settings/agents. It lets the agent list your wallets and queue requests as you. |
| `MYMULTISIG_PRIVATE_KEY` | The agent's **own** owner key. With it, the agent signs approvals, executes and deploys. The key is only used locally. Add this address as an owner of the wallet. |
| `MYMULTISIG_CHAINS` | Comma-separated chain id allowlist, e.g. `11155111`. |
| `MYMULTISIG_READ_ONLY` | Set to `1` to expose read tools only. |
| `MYMULTISIG_RPC_URL_<chainId>` | Custom RPC per chain. Set these in your MCP client config. |

## Skills

- `multisig-status`: owners, threshold, balances and the request queue.
- `create-multisig`: deploy a new wallet, with an optional deterministic address.
- `propose-transaction`: queue a transfer or contract call and share the link.
- `review-and-sign`: decode, verify and sign a request after confirmation.
- `execute-queue`: execute requests that reached their threshold, in order.

Full guide: https://mymultisig.app/docs/ai-agents
