# mymultisig-cli

This is the command line for [MyMultiSig](https://mymultisig.app) multi-signature wallets. It prints human-readable output by default and JSON with `--json`, which makes it easy to use from scripts and AI agents.

```bash
npx mymultisig-cli --help
```

Credentials come from the environment:
- `MYMULTISIG_PRIVATE_KEY`: your owner key. It signs locally and is never uploaded.
- `MYMULTISIG_API_KEY`: an `mms_…` key from https://mymultisig.app/settings/agents.
- `MYMULTISIG_RPC_URL_<chainId>`: a custom RPC for a chain.

```bash
mymultisig networks
mymultisig wallet get 11155111 0xYourMultisig
mymultisig wallet create --chain 11155111 --name Treasury --owner 0xA… --owner 0xB… --threshold 2 --yes
mymultisig request list 11155111 0xYourMultisig
mymultisig request propose --chain 11155111 --wallet 0x… --to 0x… --value-ether 0.01 --description "Test payment"
mymultisig request show 11155111 <requestId>
mymultisig request approve 11155111 <requestId> --yes
mymultisig request execute 11155111 <requestId> --yes
mymultisig keys create --name "CI bot" --scope read --scope propose --expires-in-days 30
```

Irreversible actions (deploy, approve, execute, cancel, reset, revoke) ask for confirmation. When the shell isn't interactive, they require `--yes`.
