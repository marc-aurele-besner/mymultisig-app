// Moved to the shared protocol module (packages/sdk/src/protocol) so the web
// app and agent tooling (SDK, MCP server, CLI) sign the exact same struct.
export {
  buildTransactionTypedData,
  buildAllowanceTypedData,
  transactionValidUntil,
  transactionOperation
} from '@mymultisig/protocol'
export type {
  TransactionTypedData,
  TransactionTypedDataInput,
  AllowanceTypedData,
  AllowanceTypedDataInput
} from '@mymultisig/protocol'
