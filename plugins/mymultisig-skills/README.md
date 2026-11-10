# MyMultiSig Skills

Workflow skills that teach Claude to work with [MyMultiSig](https://mymultisig.app) multi-signature wallets on EVM chains. MyMultiSig is an open-source, non-custodial multisig: owners sign requests off-chain (EIP-712), and a request executes on-chain once enough owners have signed.

This plugin contains **skills only**. It doesn't install or start any server, hook or script. The skills use the tools of the [`mymultisig-mcp`](https://www.npmjs.com/package/mymultisig-mcp) MCP server, which you add yourself (see Setup).

## Install

```
/plugin install mymultisig-skills@mymultisig
```

That needs the marketplace first: `/plugin marketplace add marc-aurele-besner/mymultisig-app`. If you'd rather have the MCP server bundled, install the `mymultisig` plugin from the same marketplace instead. Install one or the other, not both, because they contain the same skills.

## Skills

- `multisig-status`: owners, threshold, balances and the request queue.
- `create-multisig`: deploy a new wallet, with an optional deterministic address.
- `propose-transaction`: queue a transfer or contract call and share the link.
- `review-and-sign`: decode, verify and sign a request after confirmation.
- `execute-queue`: execute requests that reached their threshold, in order.

## Setup

Add the MyMultiSig MCP server once, from your terminal:

```
claude mcp add mymultisig -- npx -y mymultisig-mcp@0.1.3
```

All of these settings are optional; set them as environment variables on the server (`claude mcp add … -e NAME=value`):
- `MYMULTISIG_API_KEY`: a scoped key from https://mymultisig.app/settings/agents.
- `MYMULTISIG_PRIVATE_KEY`: the agent's own owner key. It's used only on your machine.
- `MYMULTISIG_CHAINS`: a chain id allowlist.
- `MYMULTISIG_READ_ONLY=1`: read tools only.

Without them, Claude can still read public wallet state and queued requests. The full guide is at https://mymultisig.app/docs/ai-agents.

## Safety

A human stays in the loop:
- every write goes through an MCP tool annotated as a write, and the skills ask for an explicit "yes" before signing or executing;
- the server refuses to execute a request that only the agent has signed;
- the server refuses to deploy a wallet the agent could run alone.

## What this plugin runs and sends

- **The plugin itself** runs nothing and sends nothing. It is Markdown instructions only.
- **The `mymultisig-mcp` server you add** runs locally.
  - It sends REST calls to https://mymultisig.app with your API key or a Sign-In with Ethereum session, plus request data and signatures.
  - It sends contract reads and the transactions the agent signs to public RPC endpoints of the chains you use.
  - It never sends the private key.

Source: [`packages/mcp`](https://github.com/marc-aurele-besner/mymultisig-app/tree/main/packages/mcp).

## Privacy

The plugin collects no data and no telemetry. Data the MCP server sends to mymultisig.app is covered by the MyMultiSig privacy policy at https://mymultisig.app/privacy.

To report a vulnerability, see [SECURITY.md](https://github.com/marc-aurele-besner/mymultisig-app/blob/main/SECURITY.md). For questions, open an issue at https://github.com/marc-aurele-besner/mymultisig-app/issues.
