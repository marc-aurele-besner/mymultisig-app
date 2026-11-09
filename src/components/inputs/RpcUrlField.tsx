import React, { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckIcon, WarningIcon } from '../icons/ChakraIcons'
import { isValidRpcUrl } from '../../states/rpcConfig'

interface RpcUrlFieldProps {
  id: string
  label: string
  chainId: number
  // The URL currently saved for this scope, if any.
  value: string | undefined
  onSave: (url: string | null) => void
}

type Feedback = { tone: 'success' | 'error'; text: string } | null

// Asks the endpoint for its chain id so a URL for the wrong network (or a dead
// one) is caught before it replaces the app's default RPC.
const probeRpc = async (url: string, chainId: number): Promise<Feedback> => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }),
      signal: AbortSignal.timeout(10_000)
    })
    if (!res.ok) return { tone: 'error', text: `The endpoint answered HTTP ${res.status}.` }
    const body = (await res.json()) as { result?: string; error?: { message?: string } }
    if (body.error != null) return { tone: 'error', text: body.error.message ?? 'The endpoint returned an error.' }
    const remote = body.result != null ? Number(BigInt(body.result)) : NaN
    if (remote !== chainId)
      return { tone: 'error', text: `This endpoint serves chain ${remote}, not chain ${chainId}.` }
    return { tone: 'success', text: 'The endpoint answered for the right chain.' }
  } catch (e) {
    return { tone: 'error', text: `Could not reach the endpoint: ${(e as Error).message}` }
  }
}

const RpcUrlField: React.FC<RpcUrlFieldProps> = ({ id, label, chainId, value, onSave }) => {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState(value ?? '')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)

  useEffect(() => {
    setDraft(value ?? '')
  }, [value])

  const trimmed = draft.trim()
  const dirty = trimmed !== (value ?? '')

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isValidRpcUrl(trimmed)) {
      setFeedback({ tone: 'error', text: 'Enter an http(s) RPC URL.' })
      return
    }
    setBusy(true)
    const result = await probeRpc(trimmed, chainId)
    setBusy(false)
    setFeedback(result)
    if (result?.tone !== 'success') return
    onSave(trimmed)
    // Refetch on-chain reads through the new endpoint.
    void queryClient.invalidateQueries()
  }

  const onClear = () => {
    onSave(null)
    setDraft('')
    setFeedback(null)
    void queryClient.invalidateQueries()
  }

  return (
    <form className='flex w-full flex-col gap-2' onSubmit={onSubmit} noValidate>
      <Label htmlFor={id}>{label}</Label>
      <div className='flex flex-col gap-2 sm:flex-row'>
        <Input
          id={id}
          type='url'
          inputMode='url'
          autoComplete='off'
          spellCheck={false}
          placeholder='https://… (leave empty to use the default RPC)'
          className='font-mono text-sm'
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            setFeedback(null)
          }}
        />
        <div className='flex gap-2'>
          <Button type='submit' disabled={busy || trimmed.length === 0 || !dirty}>
            {busy ? 'Testing…' : 'Test & save'}
          </Button>
          {value != null && (
            <Button type='button' variant='outline' onClick={onClear} disabled={busy}>
              Reset
            </Button>
          )}
        </div>
      </div>
      {feedback != null && (
        <div
          role='status'
          className={
            feedback.tone === 'success'
              ? 'flex items-start gap-2 text-sm text-foreground'
              : 'flex items-start gap-2 text-sm text-destructive'
          }
        >
          {feedback.tone === 'success' ? (
            <CheckIcon className='mt-0.5 h-4 w-4 shrink-0 text-primary' />
          ) : (
            <WarningIcon className='mt-0.5 h-4 w-4 shrink-0' />
          )}
          <span>{feedback.text}</span>
        </div>
      )}
    </form>
  )
}

export default RpcUrlField
