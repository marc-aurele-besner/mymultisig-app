import { parseEventLogs, Abi, Log } from 'viem'
import MyMultiSigFactory from 'mymultisig-contract/abi/MyMultiSigFactory.json'
import contractConstants from 'mymultisig-contract/constants'

import { LegacyMyMultiSigCreatedEvent } from '../constants/abi/legacy'

export type MyMultiSigCreatedArgs = {
  creator: string
  contractAddress: string
  contractIndex: bigint
  contractName: string
  originalOwners: string[]
  // Only present on factory >= 0.1.x events.
  threshold?: number
}

// Extracts the MyMultiSigCreated event straight from a creation transaction's
// receipt logs. Unlike an event watcher, this cannot miss the event: the
// receipt is the canonical record of what the transaction emitted. Tries the
// current factory shape first, then the pre-0.1.x legacy shape (different
// topic hash).
export const extractMyMultiSigCreated = (
  logs: Log[]
): { args: MyMultiSigCreatedArgs; contractVersion: string } | null => {
  const current = parseEventLogs({ abi: MyMultiSigFactory as Abi, logs, eventName: 'MyMultiSigCreated' })
  if (current.length > 0)
    return {
      args: current[0].args as unknown as MyMultiSigCreatedArgs,
      contractVersion: contractConstants.CONTRACT_VERSION
    }
  const legacy = parseEventLogs({ abi: LegacyMyMultiSigCreatedEvent, logs, eventName: 'MyMultiSigCreated' })
  if (legacy.length > 0) return { args: legacy[0].args as unknown as MyMultiSigCreatedArgs, contractVersion: '0.0.2' }
  return null
}
