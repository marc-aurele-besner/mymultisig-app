import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import TextInput from '../inputs/TextInput'
import SignRequest from '../buttons/SignRequest'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import useWalletType from '../../hooks/useWalletType'
import { adminActionsFor, encodeAdminAction } from '../../utils/adminActions'

interface AdminActionFormProps {
  multiSigAddress: `0x${string}`
}

const DEFAULT_ADMIN_GAS = '75000'

// First-class owners/threshold management: picks an onlyThis function, encodes
// the self-call, and hands it to the regular sign -> execute request pipeline.
const AdminActionForm: React.FC<AdminActionFormProps> = ({ multiSigAddress }) => {
  const { address } = useAccount()
  const { multiSigDetails } = useMultiSigDetails(multiSigAddress, address ?? '0x')
  const { walletType } = useWalletType(multiSigAddress)
  const [actionId, setActionId] = useState<string>('')
  const [values, setValues] = useState<Record<string, string>>({})

  const actions = adminActionsFor(walletType)
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
    setActionId(id)
    const next = actions.find((a) => a.id === id)
    const defaults: Record<string, string> = {}
    next?.fields.forEach((f) => {
      if (f.kind === 'boolean') defaults[f.key] = 'false'
    })
    setValues(defaults)
  }

  return (
    <div className='flex w-full flex-col gap-4 rounded-lg border border-border p-4'>
      <h3 className='text-xl font-bold text-foreground'>Owner & wallet administration</h3>
      <p className='text-sm text-muted-foreground'>
        These operations are multisig transactions: they still need {details.threshold} owner signature
        {details.threshold > 1 ? 's' : ''} before they execute.
      </p>
      <Select value={actionId} onValueChange={handleSelect}>
        <SelectTrigger className='w-full'>
          <SelectValue placeholder='Choose an operation' />
        </SelectTrigger>
        <SelectContent>
          {actions.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.danger ? '⚠ ' : ''}
              {a.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {action != null && (
        <>
          <p className={`text-sm ${action.danger ? 'text-destructive' : 'text-muted-foreground'}`}>{action.hint}</p>
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
          {fieldsFilled && validationError != null && <p className='text-sm text-destructive'>{validationError}</p>}
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
        </>
      )}
    </div>
  )
}

export default AdminActionForm
