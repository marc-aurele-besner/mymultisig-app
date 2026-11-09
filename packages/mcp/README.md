# mymultisig-mcp

This is a [Model Context Protocol](https://modelcontextprotocol.io) server for [MyMultiSig](https://mymultisig.app) multi-signature wallets. It lets Claude, Cursor or any MCP client inspect wallets, decode and review requests, propose transactions, sign them and execute them.

## Setup

**Claude Code**

```bash
claude mcp add mymultisig \
  -e MYMULTISIG_API_KEY=mms_… \
  -e MYMULTISIG_PRIVATE_KEY=0x… \
  -e MYMULTISIG_CHAINS=11155111 \
  -- npx -y mymultisig-mcp
```

You can also install the plugin, which adds workflow skills on top of the server:

```
/plugin marketplace add marc-aurele-besner/mymultisig-app
/plugin install mymultisig@mymultisig
```

**Other clients (Claude Desktop, Cursor, …)**

```json
{
  "mcpServers": {
    "mymultisig": {
      "command": "npx",
      "args": ["-y", "mymultisig-mcp"],
      "env": { "MYMULTISIG_API_KEY": "mms_…", "MYMULTISIG_PRIVATE_KEY": "0x…" }
    }
  }
}
```

| Env var | Meaning |
|---|---|
| `MYMULTISIG_API_KEY` | Scoped key from https://mymultisig.app/settings/agents. It acts as your wallet on the API. |
| `MYMULTISIG_PRIVATE_KEY` | The agent's own owner key. The agent needs it to sign approvals, execute and deploy. It is used locally and never sent anywhere. |
| `MYMULTISIG_CHAINS` | Allowlist of chain ids, comma-separated. |
| `MYMULTISIG_READ_ONLY` | Set to `1` to register read tools only. |
| `MYMULTISIG_RPC_URL_<chainId>` | Custom RPC for a chain. |
| `MYMULTISIG_API_URL` | Defaults to `https://mymultisig.app`. |

## Tools

- **Read:**
  - `whoami`, `list_networks`;
  - `get_multisig`, `list_my_multisigs`, `list_requests`;
  - `get_request`: the decoded call, risk warnings and locally verified signatures;
  - `get_balances`, `predict_multisig_address`, `encode_function_call`.
- **Write:**
  - `create_multisig`, `propose_transaction`;
  - `approve_request`;
  - `execute_request`: simulates first and refuses when signatures are missing or invalid;
  - `cancel_request`, `reset_request`.

Write tools carry MCP annotations (`destructiveHint` and similar), so clients can ask you for confirmation. The server's instructions also tell the model to show `get_request` output and get your approval before it signs or executes.

**Safety:** give the agent a threshold it can't reach on its own, keep API key scopes to the minimum, and start on a testnet. See https://mymultisig.app/docs/ai-agents.
