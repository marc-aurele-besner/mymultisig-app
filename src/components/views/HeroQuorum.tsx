import React, { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CheckIcon } from '../icons/ChakraIcons'
import { cn } from '@/lib/utils'

const OWNERS = [
  { name: 'ava.eth', address: '0x7A3f…9C4e', signsAt: 1 },
  { name: 'sam.eth', address: '0xB81c…44D0', signsAt: 2 },
  { name: 'kim.eth', address: '0x03eE…F7a2', signsAt: 0 }
]

const THRESHOLD = 2

// The card loops the core mechanic forever: owners sign, quorum is reached,
// the transaction executes, and the next proposal begins.
type Phase = 'idle' | 'sig1' | 'sig2' | 'executed'

const NEXT_PHASE: Record<Phase, { next: Phase; after: number }> = {
  idle: { next: 'sig1', after: 1400 },
  sig1: { next: 'sig2', after: 1100 },
  sig2: { next: 'executed', after: 2600 },
  executed: { next: 'idle', after: 3200 }
}

/**
 * Illustrative pending transaction that plays the core mechanic on a loop:
 * two of three owners sign, quorum is reached, execute fires, and the ledger
 * advances to the next proposal. Reduced motion shows the quorum state static.
 */
const HeroQuorum: React.FC = () => {
  const prefersReducedMotion = useReducedMotion()
  const [phase, setPhase] = useState<Phase>(prefersReducedMotion ? 'sig2' : 'idle')
  const [proposalNumber, setProposalNumber] = useState(42)

  useEffect(() => {
    if (prefersReducedMotion) return
    const { next, after } = NEXT_PHASE[phase]
    const timer = setTimeout(() => {
      if (phase === 'executed') setProposalNumber((n) => n + 1)
      setPhase(next)
    }, after)
    return () => clearTimeout(timer)
  }, [phase, prefersReducedMotion])

  const signedCount = phase === 'idle' ? 0 : phase === 'sig1' ? 1 : 2
  const quorumReached = signedCount >= THRESHOLD
  const executed = phase === 'executed'
  const status = executed ? 'EXECUTED' : quorumReached ? 'QUORUM REACHED' : 'AWAITING SIGNATURES'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
      className="w-full"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-700',
          quorumReached && !executed && 'shadow-[0_0_70px_-18px] shadow-primary/35',
          executed && 'shadow-[0_0_80px_-14px] shadow-primary/50'
        )}
      >
        <div className="pointer-events-none absolute left-[10%] right-[10%] top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <motion.span
            key={proposalNumber}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="font-mono text-xs tracking-wider text-muted-foreground"
          >
            PROPOSAL #{String(proposalNumber).padStart(4, '0')}
          </motion.span>
          <span
            className={cn(
              'rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wider transition-colors duration-500',
              executed
                ? 'border-primary bg-primary text-primary-foreground'
                : quorumReached
                  ? 'border-primary/40 bg-primary/15 text-primary'
                  : 'border-border bg-muted text-muted-foreground'
            )}
          >
            <motion.span
              key={status}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="inline-block"
            >
              {status}
            </motion.span>
          </span>
        </div>

        <div className="border-b border-border px-5 py-4">
          <p className="text-sm text-muted-foreground">Send</p>
          <p className="font-display text-2xl font-bold tracking-tight text-foreground">12.5 ETH</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">to 0x4Fd1…08bA</p>
        </div>

        <ul className="flex flex-col divide-y divide-border">
          {OWNERS.map((owner) => {
            const hasSigned = owner.signsAt > 0 && signedCount >= owner.signsAt
            return (
              <li key={owner.name} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-md font-mono text-xs transition-colors duration-500',
                      hasSigned ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {owner.name.slice(0, 2)}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{owner.name}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{owner.address}</span>
                  </div>
                </div>
                {hasSigned ? (
                  <motion.span
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex items-center gap-1.5 font-mono text-xs text-primary"
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                    Signed
                  </motion.span>
                ) : (
                  <span className="font-mono text-xs text-muted-foreground">Awaiting</span>
                )}
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-4 border-t border-border px-5 py-4">
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex gap-1.5">
              {Array.from({ length: OWNERS.length }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors duration-500',
                    i < signedCount ? 'bg-primary' : 'bg-muted'
                  )}
                />
              ))}
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              {signedCount} of {OWNERS.length} signed · {THRESHOLD} required
            </span>
          </div>
          <motion.div
            animate={executed && !prefersReducedMotion ? { scale: [1, 0.94, 1] } : { scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="shrink-0"
          >
            <Button size="sm" disabled={!quorumReached} className="gap-1.5" tabIndex={-1}>
              {executed && <CheckIcon className="h-3.5 w-3.5" />}
              {executed ? 'Executed' : 'Execute transaction'}
            </Button>
          </motion.div>
        </div>
      </div>

      <p className="mt-3 px-1 text-center text-xs text-muted-foreground lg:text-left">
        A 2-of-3 multisig: once two owners sign, any owner can execute.
      </p>
    </motion.div>
  )
}

export default HeroQuorum
