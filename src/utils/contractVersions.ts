// Moved to the shared protocol module (packages/sdk/src/protocol) so the web
// app and agent tooling (SDK, MCP server, CLI) can never drift apart.
export {
  gteVersion,
  isModernWallet,
  isModernFactory,
  hasWalletBoundEip1271,
  WALLET_BOUND_EIP1271_FROM_VERSION
} from '@mymultisig/protocol'
