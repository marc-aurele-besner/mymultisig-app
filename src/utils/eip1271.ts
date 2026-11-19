// Moved to the shared protocol module (packages/sdk/src/protocol) so the web
// app and agent tooling sign EIP-1271 votes with the exact same typed data.
export {
  buildEip1271VoteTypedData,
  buildMessageTypedData,
  eip1271DigestFor,
  eip1271Message,
  walletMessageHash
} from '@mymultisig/protocol'
export type { MessageTypedData } from '@mymultisig/protocol'
