import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

import TextInput from '../inputs/TextInput'
import SignRequest from '../buttons/SignRequest'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import useWalletType from '../../hooks/useWalletType'
import { adminActionsFor, encodeAdminAction, ADMIN_ACTION_GROUPS } from '../../utils/adminActions'

interface AdminActionFormProps {
  multiSigAddress: `0x${string}`
}

const DEFAULT_ADMIN_GAS = '75000'

// First-class owners/threshold management: picks an onlyThis function, encodes
// the self-call, and hands it to the regular sign -> execute request pipeline.
// Actions are grouped by concern; selecting one expands its form inline.
const AdminActionForm: React.FC<AdminActionFormProps> = ({ multiSigAddress }) => {
  const { address } = useAccount()
  const { multiSigDetails } = useMultiSigDetails(multiSigAddress, address ?? '0x')
  const { walletType } = useWalletType(multiSigAddress)
  const [actionId, setActionId] = useState<string>('')
  const [values, setValues] = useState<Record<string, string>>({})

  const actions = adminActionsFor(walletType, multiSigDetails?.version)
  const action = actions.find((a) => a.id === actionId)

  const details = {
    threshold: multiSigDetails?.threshold ?? 1,
    ownerCount: multiSigDetails?.ownerCount ?? 1
  }
  const validationError = action ? action.validate(values, details) : null
  const fieldsFilled = action ? action.fields.every((f) => f.kind === 'boolean' || (values[f.key] ?? '') !== '') : false
  const ready = action != null && fieldsFilled && validationError == null

  let encoded: `0x${string}` | null = null
  if (ready && action) {
    try {
      encoded = encodeAdminAction(action, values)
    } catch {
      encoded = null
    }
  }

  const handleSelect = (id: string) => {
    if (id === actionId) {
      setActionId('')
      return
    }
    setActionId(id)
    const next = actions.find((a) => a.id === id)
    const defaults: Record<string, string> = {}
    next?.fields.forEach((f) => {
      if (f.kind === 'boolean') defaults[f.key] = 'false'
    })
    setValues(defaults)
  }

  const groupContext = (groupId: string): string | null => {
    if (multiSigDetails == null) return null
    switch (groupId) {
      case 'owners':
        return `${multiSigDetails.ownerCount} owner${multiSigDetails.ownerCount === 1 ? '' : 's'}`
      case 'policy':
        return `Currently ${multiSigDetails.threshold} of ${multiSigDetails.ownerCount} signatures`
      case 'nonce':
        return `Current nonce: ${multiSigDetails.nonce}`
      default:
        return null
    }
  }

  return (
    <div className='flex w-full flex-col gap-4 rounded-lg border border-border p-4'>
      <div>
        <h3 className='text-xl font-bold text-foreground'>Owner & wallet administration</h3>
        <p className='text-sm text-muted-foreground'>
          These operations are multisig transactions: they still need {details.threshold} owner signature
          {details.threshold > 1 ? 's' : ''} before they execute.
        </p>
      </div>

      {ADMIN_ACTION_GROUPS.map((group) => {
        const groupActions = actions.filter((a) => a.group === group.id)
        if (groupActions.length === 0) return null
        const context = groupContext(group.id)
        return (
          <div key={group.id} className='flex flex-col gap-2 rounded-lg border border-border p-3'>
            <div className='flex flex-wrap items-baseline justify-between gap-2'>
              <div className='flex flex-col'>
                <span className='text-sm font-semibold text-foreground'>{group.label}</span>
                <span className='text-xs text-muted-foreground'>{group.hint}</span>
              </div>
              {context != null && (
                <span className='rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground'>{context}</span>
              )}
            </div>
            <div className='flex flex-wrap gap-2'>
              {groupActions.map((a) => (
                <Button
                  key={a.id}
                  size='sm'
                  variant={actionId === a.id ? 'default' : 'outline'}
                  className={cn(a.danger && actionId !== a.id && 'border-destructive/50 text-destructive')}
                  onClick={() => handleSelect(a.id)}
                >
                  {a.danger ? '⚠ ' : ''}
                  {a.label}
                </Button>
              ))}
            </div>

            {action != null && action.group === group.id && (
              <div className='mt-1 flex flex-col gap-3 rounded-lg bg-muted/30 p-3'>
                <p className={`text-sm ${action.danger ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {action.hint}
                </p>
                {action.fields.map((field) =>
                  field.kind === 'boolean' ? (
                    <div key={field.key} className='flex items-center gap-3'>
                      <Switch
                        checked={values[field.key] === 'true'}
                        onCheckedChange={(checked) => setValues({ ...values, [field.key]: String(checked) })}
                      />
                      <span className='text-sm text-foreground'>{field.label}</span>
                    </div>
                  ) : (
                    <div key={field.key} className='flex flex-col gap-1'>
                      <span className='text-sm font-semibold text-foreground'>{field.label}</span>
                      <TextInput
                        placeholder={field.placeholder ?? field.label}
                        value={values[field.key] ?? ''}
                        onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                      />
                    </div>
                  )
                )}
                {fieldsFilled && validationError != null && (
                  <p className='text-sm text-destructive'>{validationError}</p>
                )}
                {ready && encoded != null && (
                  <SignRequest
                    multiSigAddress={multiSigAddress}
                    description={action.describe(values)}
                    args={{
                      to: multiSigAddress,
                      value: '0',
                      data: encoded,
                      txnGas: DEFAULT_ADMIN_GAS,
                      signatures: ''
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default AdminActionForm
