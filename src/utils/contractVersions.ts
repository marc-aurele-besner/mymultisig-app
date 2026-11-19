// Moved to the shared protocol module (packages/sdk/src/protocol) so the web
// app and agent tooling (SDK, MCP server, CLI) can never drift apart.
export { gteVersion, isModernWallet, isModernFactory, hasUnrestrictedAllowance } from '@mymultisig/protocol'
