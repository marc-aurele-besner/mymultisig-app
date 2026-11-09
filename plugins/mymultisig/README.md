# MyMultiSig plugin for Claude Code

This plugin lets Claude create, inspect, propose, review, sign and execute [MyMultiSig](https://mymultisig.app) multi-signature wallet transactions on EVM chains. MyMultiSig is an open-source, non-custodial multisig: owners sign requests off-chain (EIP-712), and a request executes on-chain once enough owners have signed.

## Install

```
/plugin marketplace add marc-aurele-besner/mymultisig-app
/plugin install mymultisig@mymultisig
```

## Configure

When you enable the plugin, Claude Code asks for these settings. All of them are optional, and you can change them later in `/config`. The two keys are masked and kept in your system's secure credential store, not in `settings.json`.

| Setting | Purpose |
|---|---|
| MyMultiSig API key | `mms_…` key from https://mymultisig.app/settings/agents. It lets the agent list your wallets and queue requests as you. Scope it (`read`, `propose`, `sign`, `manage`) and limit it to specific wallets when you create it. |
| Agent owner private key | The agent's **own** owner key. With it, the agent signs approvals, executes and deploys. Use a dedicated key, add its address as an owner, and keep the threshold above what the agent can reach alone. |
| Allowed chain ids | Comma-separated chain id allowlist, e.g. `11155111`. |
| Read-only mode | Expose read tools only. |

Without any setting, the agent can still read public wallet state and queued requests.

## Skills

- `multisig-status`: owners, threshold, balances and the request queue.
- `create-multisig`: deploy a new wallet, with an optional deterministic address.
- `propose-transaction`: queue a transfer or contract call and share the link.
- `review-and-sign`: decode, verify and sign a request after confirmation.
- `execute-queue`: execute requests that reached their threshold, in order.

Every write (deploy, propose, approve, execute, cancel, reset) is an MCP tool marked destructive, so Claude asks before running it.

## What this plugin runs and sends

- **Runs:** the [`mymultisig-mcp`](https://www.npmjs.com/package/mymultisig-mcp) MCP server, pinned to an exact version and started locally with `npx`. Its source is in [`packages/mcp`](https://github.com/marc-aurele-besner/mymultisig-app/tree/main/packages/mcp) of this repository.
- **Sends to https://mymultisig.app:** REST calls to list wallets and requests and to queue, sign, cancel or reset requests. Those calls carry your API key (as a `Bearer` header) or a Sign-In with Ethereum session signed locally. They also carry request data and the EIP-712 signatures the agent produced.
- **Sends to public RPC endpoints of the chains you use:** contract reads, and transactions the agent signs (deploy and execute).
- **Never sends:** the private key. It is only used in the local process to sign.

## Privacy

The plugin collects no telemetry. Data sent to mymultisig.app (wallet addresses, queued requests, signatures, API key usage time) is stored to run the multisig queue, as described in the MyMultiSig privacy policy: https://mymultisig.app/privacy. RPC providers see the calls made to them under their own policies. Questions: https://github.com/marc-aurele-besner/mymultisig-app/issues.

Full guide: https://mymultisig.app/docs/ai-agents
