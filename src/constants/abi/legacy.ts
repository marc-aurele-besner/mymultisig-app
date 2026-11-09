// Moved to the shared protocol module (packages/sdk/src/protocol/legacyAbi.ts)
// so agent tooling decodes pre-0.5.0 wallets the same way the app does.
export {
  LegacyTransactionFailedEvent,
  LegacyHashFragments,
  LegacyWalletErrors,
  LegacyFactoryDeployAbi,
  LEGACY_FACTORY_DEPLOY_VERSION,
  LegacyCreateExtendedFragment,
  LegacyMyMultiSigCreatedEvent
} from '@mymultisig/protocol'
