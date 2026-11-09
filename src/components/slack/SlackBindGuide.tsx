import React, { useState } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { bindCommandFor } from '../../lib/slack/chainAliases'
import { SlackWorkspace } from '../../models/Slack'
import { CheckIcon, CopyIcon, ExternalLinkIcon, RefreshIcon } from '../icons/ChakraIcons'

export interface BindableMultiSig {
  address: `0x${string}`
  chainId: number
  chainName: string
  name: string
}

export interface SlackBindGuideProps {
  workspaces: SlackWorkspace[]
  // The connected wallet's multisigs, used to prefill one `/bind` command
  // per multisig. Empty shows a generic command with placeholders.
  multiSigs: BindableMultiSig[]
  onRefresh: () => void
  refreshing?: boolean
}

const shortenAddress = (address: string): string => `${address.slice(0, 6)}…${address.slice(-4)}`

// Slack's web client URL for a workspace. On a machine with the desktop app
// installed, Slack offers to open it there.
export const slackWorkspaceUrl = (teamId: string): string => `https://app.slack.com/client/${encodeURIComponent(teamId)}`

export const CopyCommand: React.FC<{ command: string; label?: string; className?: string }> = ({
  command,
  label,
  className
}) => {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access denied; the command stays selectable for manual copy.
    }
  }
  return (
    <div className={cn('flex min-w-0 items-center gap-2 rounded-md border border-border bg-muted/40 p-1 pl-3', className)}>
      <code className='min-w-0 flex-1 select-all py-1 [overflow-wrap:anywhere] font-mono text-xs text-foreground' title={command}>
        {command}
      </code>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => void onCopy()}
        aria-label={label ?? `Copy ${command}`}
        className='shrink-0'
      >
        {copied ? <CheckIcon className='h-4 w-4 animate-pop-in text-primary' /> : <CopyIcon className='h-4 w-4' />}
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  )
}

const Step: React.FC<{ n: number; title: string; children: React.ReactNode }> = ({ n, title, children }) => (
  <li className='flex gap-3'>
    <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-mono text-xs text-primary'>
      {n}
    </span>
    <div className='flex min-w-0 flex-1 flex-col gap-2 pt-0.5'>
      <span className='text-sm font-semibold text-foreground'>{title}</span>
      {children}
    </div>
  </li>
)

// Walks a user from "app added to the workspace" to "channel bound". The
// binding itself has to happen in Slack (the channel id only exists there),
// so this guide's job is to hand over the exact command to paste.
const SlackBindGuide: React.FC<SlackBindGuideProps> = ({ workspaces, multiSigs, onRefresh, refreshing = false }) => {
  return (
    <ol className='flex flex-col gap-5'>
      <Step n={1} title='Open the channel in Slack'>
        <p className='text-xs leading-relaxed text-muted-foreground'>
          Pick the channel where your team should see new requests, for example{' '}
          <span className='font-mono'>#treasury</span>.
        </p>
        <div className='flex flex-wrap gap-2'>
          {workspaces.map((w) => (
            <Button key={w.teamId} variant='outline' size='sm' asChild>
              <a href={slackWorkspaceUrl(w.teamId)} target='_blank' rel='noreferrer'>
                <ExternalLinkIcon className='h-4 w-4' />
                Open {w.teamName}
              </a>
            </Button>
          ))}
        </div>
      </Step>

      <Step n={2} title='Private channel? Invite the bot first'>
        <p className='text-xs leading-relaxed text-muted-foreground'>
          Public channels work straight away. In a private channel, run this once so the bot can post there.
        </p>
        <CopyCommand command='/invite @MyMultiSig' className='max-w-sm' />
      </Step>

      <Step n={3} title='Paste the bind command in the channel'>
        {multiSigs.length > 0 ? (
          <>
            <p className='text-xs leading-relaxed text-muted-foreground'>
              One command per multisig. Run several in the same channel to follow more than one.
            </p>
            <ul className='flex flex-col gap-2'>
              {multiSigs.map((m) => (
                <li key={`${m.chainId}:${m.address}`} className='flex flex-col gap-1'>
                  <span className='text-xs text-muted-foreground'>
                    <span className='font-semibold text-foreground'>{m.name || shortenAddress(m.address)}</span> ·{' '}
                    {m.chainName}
                  </span>
                  <CopyCommand
                    command={bindCommandFor(m.chainId, m.address)}
                    label={`Copy bind command for ${m.name || m.address}`}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p className='text-xs leading-relaxed text-muted-foreground'>
              Replace the chain and address with your multisig&apos;s. The chain can be a name such as{' '}
              <span className='font-mono'>sepolia</span> or a chain id such as{' '}
              <span className='font-mono'>11155111</span>.
            </p>
            <CopyCommand command='/bind sepolia 0xYourMultisigAddress' />
            <p className='text-xs text-muted-foreground'>
              Don&apos;t see your multisig here?{' '}
              <Link href='/open-multisig' className='text-primary underline-offset-4 hover:underline'>
                Open or import it
              </Link>{' '}
              and the exact command will appear on this page.
            </p>
          </>
        )}
      </Step>

      <Step n={4} title='Check the confirmation'>
        <p className='text-xs leading-relaxed text-muted-foreground'>
          The bot posts &ldquo;connected this channel&rdquo; in the channel, and the binding shows up on this page.
          If Slack says it can&apos;t post there, go back to step 2.
        </p>
        <div>
          <Button variant='outline' size='sm' onClick={onRefresh} disabled={refreshing}>
            <RefreshIcon className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            {refreshing ? 'Checking…' : 'Check for new bindings'}
          </Button>
        </div>
      </Step>
    </ol>
  )
}

export default SlackBindGuide
