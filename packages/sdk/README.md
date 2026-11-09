# mymultisig-sdk

This is the TypeScript SDK for [MyMultiSig](https://mymultisig.app) multi-signature wallets. It lets you create wallets, propose requests, sign them, verify them and execute them from scripts, bots and AI agents. It is built on [viem](https://viem.sh).

```bash
npm install mymultisig-sdk viem
```

```ts
import { MyMultiSigClient } from 'mymultisig-sdk'

const client = new MyMultiSigClient({
  apiKey: process.env.MYMULTISIG_API_KEY, // optional: mms_… from https://mymultisig.app/settings/agents
  privateKey: process.env.MYMULTISIG_PRIVATE_KEY as `0x${string}`, // optional: your agent's own owner key (local only)
  allowedChainIds: [11155111]
})

const wallet = await client.getWallet(11155111, '0xYourMultisig')

const { id, link } = await client.proposeTransaction({
  chainId: 11155111,
  wallet: wallet.address,
  to: '0xRecipient',
  value: '10000000000000000', // wei
  description: 'Test payment'
})

const status = await client.getRequestStatus(11155111, id) // decoded call, warnings, verified signatures
if (status.readyToExecute) await client.executeRequest(11155111, id)
```

## What's inside

- **`MyMultiSigClient`** is the high-level client:
  - wallets: `getWallet`, `listMyWallets`, `createWallet`, `predictWalletAddress`;
  - requests: `listRequests`, `getRequestStatus`, `proposeTransaction`, `approveRequest`, `executeRequest`, `cancelRequest`, `resetRequest`.
- **`ApiClient`** is a typed REST client. It authenticates with a Bearer API key, or with SIWE using a local key (`siweLogin`).
- **`mymultisig-sdk/protocol`** holds the pure protocol helpers that the mymultisig.app web app uses too:
  - `buildTransactionTypedData` (EIP-712 for every wallet version);
  - `combineSignatures` (flat for wallets before 0.5.0, ABI-encoded `(owner, sig)[]` from 0.5.0);
  - `buildExecTransactionCall` (exact overload selection);
  - `buildCreateMultiSigCall`, `buildPredictMultiSigAddressCall`.
- **`verifyRequestSignatures`** recovers every stored signature against the owner set. The server stores signatures as the client sends them, so always verify before you sign on top of them or execute.
- **`describeCall`** decodes a request offline (native transfers, ERC-20 calls, wallet admin self-calls) and returns risk warnings.

The MIT license applies. The MCP server is in [`mymultisig-mcp`](https://www.npmjs.com/package/mymultisig-mcp) and the CLI is in [`mymultisig-cli`](https://www.npmjs.com/package/mymultisig-cli).
