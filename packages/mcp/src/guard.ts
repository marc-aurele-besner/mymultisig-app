// Human-in-the-loop guard. An agent may move funds only when at least one
// other owner (a human, in the intended setup) has approved. Without it, an
// agent holding the only signature a wallet needs could transfer assets on
// its own. MYMULTISIG_ALLOW_SOLO_EXECUTION=1 lifts the guard for operators
// who deliberately want that.

export const SOLO_OVERRIDE_ENV = 'MYMULTISIG_ALLOW_SOLO_EXECUTION'

type Check = { signer: string; status: string; recovered?: string }

const same = (a: string | undefined, b: string | undefined) => a != null && b != null && a.toLowerCase() === b.toLowerCase()

// Valid approvals from owners other than the agent.
export const otherOwnerApprovals = (checks: Check[], agent: string | undefined): number =>
  checks.filter((c) => (c.status === 'valid' || c.status === 'unverifiable') && !same(c.recovered ?? c.signer, agent))
    .length

export const assertCosignedByAnotherOwner = (checks: Check[], agent: string | undefined): void => {
  if (otherOwnerApprovals(checks, agent) > 0) return
  throw new Error(
    'Refusing to execute: no owner other than this agent has approved the request. ' +
      'Ask another owner to sign it at the request link first. ' +
      `(Operators can lift this human-in-the-loop guard with ${SOLO_OVERRIDE_ENV}=1.)`
  )
}

// A wallet the agent could operate alone: the agent is an owner and the
// threshold is 1, so its own signature would be enough.
export const assertWalletNeedsAnotherOwner = (owners: string[], threshold: number, agent: string | undefined): void => {
  if (agent == null || threshold > 1 || !owners.some((o) => same(o, agent))) return
  throw new Error(
    'Refusing to deploy: with threshold 1 this agent could move funds without any other owner. ' +
      'Use a threshold of at least 2, or leave the agent out of the owners. ' +
      `(Operators can lift this human-in-the-loop guard with ${SOLO_OVERRIDE_ENV}=1.)`
  )
}
