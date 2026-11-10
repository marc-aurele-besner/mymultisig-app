import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

interface Line {
  from: 'user' | 'agent'
  // MCP tools the agent called for this reply.
  tools?: string
  body: React.ReactNode
}

const Row: React.FC<{ nonce: string; text: string; hint: string }> = ({ nonce, text, hint }) => (
  <span>
    <span className='font-mono text-muted-foreground'>{nonce}</span> {text}{' '}
    <span className='text-muted-foreground'>· {hint}</span>
  </span>
)

// Example exchange. Illustrative only: the tool names are the MCP server's,
// the conversation is not live data.
const SCRIPT: Line[] = [
  { from: 'user', body: 'What’s waiting for signatures on my Sepolia treasury?' },
  {
    from: 'agent',
    tools: 'list_requests · get_request',
    body: (
      <>
        <Row nonce='#12' text='Pay the Q4 audit deposit' hint='1/2 · needs your signature' />
        <Row nonce='#13' text='Add a fourth owner' hint='2/2 · ready' />
      </>
    )
  },
  { from: 'user', body: 'Review #12 and sign it if it matches the invoice.' },
  {
    from: 'agent',
    tools: 'get_request · approve_request',
    body: 'Decoded: plain transfer, no delegatecall, no approvals. The target matches your address book. Signed with the agent’s owner key: 2 of 2.'
  }
]

// Time each line stays before the next one appears, then the pause before
// the conversation replays.
const STEP_MS = 1900
const REPLAY_MS = 6000

const TypingDots: React.FC = () => (
  <span className='flex gap-1 self-start rounded-2xl rounded-bl-sm bg-muted px-3.5 py-3' aria-hidden>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className='h-1.5 w-1.5 rounded-full bg-muted-foreground'
        style={{ animation: 'loading-dot 1.1s infinite both', animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </span>
)

// Animated example of an agent working a multisig queue through the MCP
// server: messages arrive one at a time, then the exchange replays. With
// reduced motion the whole exchange is shown at once.
const AgentSession: React.FC = () => {
  const reduceMotion = useReducedMotion()
  const [shown, setShown] = useState(1)

  useEffect(() => {
    if (reduceMotion) return
    const done = shown >= SCRIPT.length
    const timer = setTimeout(() => setShown(done ? 1 : shown + 1), done ? REPLAY_MS : STEP_MS)
    return () => clearTimeout(timer)
  }, [shown, reduceMotion])

  const visible = reduceMotion ? SCRIPT : SCRIPT.slice(0, shown)
  const agentIsNext = !reduceMotion && shown < SCRIPT.length && SCRIPT[shown].from === 'agent'

  return (
    <div
      className='flex min-h-[380px] flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-[0_0_80px_-24px] shadow-primary/25'
      role='img'
      aria-label='Example: an agent lists the requests waiting on a multisig, then reviews and co-signs one.'
    >
      <div className='flex items-center justify-between gap-2'>
        <span className='font-mono text-[11px] uppercase tracking-wider text-muted-foreground'>
          Agent session · example
        </span>
        <span className='rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground'>
          mymultisig-mcp
        </span>
      </div>
      <AnimatePresence initial={false}>
        {visible.map((line, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            className={cn(
              'flex max-w-[92%] flex-col gap-2 px-3.5 py-2.5 text-sm',
              line.from === 'user'
                ? 'self-end rounded-2xl rounded-br-sm bg-primary text-primary-foreground'
                : 'self-start rounded-2xl rounded-bl-sm bg-muted text-foreground'
            )}
          >
            {line.tools != null && <span className='font-mono text-xs text-muted-foreground'>{line.tools}</span>}
            {line.body}
          </motion.div>
        ))}
      </AnimatePresence>
      {agentIsNext && <TypingDots />}
    </div>
  )
}

export default AgentSession
