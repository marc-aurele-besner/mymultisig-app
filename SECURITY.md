# Security policy

MyMultiSig is non-custodial: it never holds user keys or funds. Bugs can still put assets at risk, so please report vulnerabilities privately and give us time to fix them before disclosure.

## Scope

- The web app at https://mymultisig.app and its API routes (`src/pages/api`).
- The npm packages built from this repository: [`mymultisig-sdk`](https://www.npmjs.com/package/mymultisig-sdk), [`mymultisig-mcp`](https://www.npmjs.com/package/mymultisig-mcp) and [`mymultisig-cli`](https://www.npmjs.com/package/mymultisig-cli).
- The Claude Code plugin in `plugins/mymultisig`.

The multisig smart contracts live in [`mymultisig-contract`](https://github.com/marc-aurele-besner/mymultisig-contract). Report contract issues there the same way.

Examples of what we want to hear about:
- authentication or authorization bypasses (SIWE sessions, agent API keys and their scopes);
- signature handling that could get a transaction executed without the required owners;
- leaks of API keys or private keys;
- tool or skill behavior that lets an AI agent act without the safeguards this repo describes, such as the human-in-the-loop guard in `packages/mcp/src/guard.ts`.

## How to report

1. **Preferred:** open a private report from the repository's [Security tab](https://github.com/marc-aurele-besner/mymultisig-app/security/advisories/new) ("Report a vulnerability").
2. **Otherwise:** use the [contact form](https://mymultisig.app/contact) and ask for a private channel. Don't include exploit details in the first message.

Please don't open public issues or pull requests for vulnerabilities.

Include:
- the affected component and version;
- steps to reproduce;
- the impact you expect.

## What to expect

- We acknowledge reports within 3 business days.
- We send a first assessment within 10 business days.
- Fixes ship as new package versions and app deploys. We credit reporters in the advisory unless they prefer otherwise.

Only the latest published version of each package gets security fixes.
