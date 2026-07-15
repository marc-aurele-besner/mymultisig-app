import React, { useState } from 'react'
import { useChainId } from 'wagmi'
import { encodeFunctionData, Abi } from 'viem'
import { Button } from '@/components/ui/button'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'

import TextInput from '../inputs/TextInput'
import SignRequest from '../buttons/SignRequest'
import { AddIcon, DeleteIcon } from '../icons/ChakraIcons'
import { useAddressLabels } from '../../states/addressBook'
import { BatchStep } from '../../models/MultiSigs'

interface BatchRequestFormProps {
  multiSigAddress: `0x${string}`
  txnNonce?: string
}

const EMPTY_STEP: BatchStep = { to: '' as `0x${string}`, value: '0', data: '0x' as `0x${string}`, txnGas: '35000' }
// Gas consumed by the multiRequest loop itself, on top of the inner calls.
const BATCH_OVERHEAD_GAS = 50000

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)
const isUint = (value: string) => /^\d+$/.test(value)
const isHex = (value: string) => /^0x[a-fA-F0-9]*$/.test(value)

// What is stopping this step from being valid, in words the user can act on.
const stepError = (step: BatchStep): string | null => {
  if (!isAddress(step.to)) return 'needs a valid target address'
  if (!isUint(step.value)) return 'needs a whole number for value'
  if (!isUint(step.txnGas)) return 'needs a whole number for gas'
  if (!isHex(step.data)) return 'has calldata that is not valid hex'
  return null
}

// Builds a single multisig transaction that self-calls
// multiRequest(address[],uint256[],bytes[],uint256[]). Steps execute in order;
// a failing step is recorded (MultiRequestExecuted) without reverting the rest.
const BatchRequestForm: React.FC<BatchRequestFormProps> = ({ multiSigAddress, txnNonce }) => {
  const [steps, setSteps] = useState<BatchStep[]>([{ ...EMPTY_STEP }, { ...EMPTY_STEP }])
  const [description, setDescription] = useState('')
  const chainId = useChainId()
  const { entries: bookEntries, labelFor } = useAddressLabels(chainId)

  const updateStep = (index: number, key: keyof BatchStep, value: string) => {
    setSteps(steps.map((step, i) => (i === index ? { ...step, [key]: value } : step)))
  }
  const addStep = () => setSteps([...steps, { ...EMPTY_STEP }])
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index))

  const field = (label: string, children: React.ReactNode, hint?: string) => (
    <div className='flex w-full flex-col gap-1.5'>
      <span className='text-sm font-semibold text-foreground'>{label}</span>
      {children}
      {hint != null && <span className='text-xs text-muted-foreground'>{hint}</span>}
    </div>
  )

  const firstInvalidIndex = steps.findIndex((s) => stepError(s) != null)
  const stepsValid = steps.length > 0 && firstInvalidIndex === -1
  const ready = stepsValid && description.trim() !== ''

  let encoded: `0x${string}` | null = null
  let outerGas = '0'
  const totalStepGas = steps.reduce((sum, s) => (isUint(s.txnGas) ? sum + Number(s.txnGas) : sum), 0)
  if (ready) {
    try {
      encoded = encodeFunctionData({
        abi: MyMultiSig as Abi,
        functionName: 'multiRequest',
        args: [
          steps.map((s) => s.to),
          steps.map((s) => BigInt(s.value)),
          steps.map((s) => s.data),
          steps.map((s) => BigInt(s.txnGas))
        ]
      })
      outerGas = String(totalStepGas + BATCH_OVERHEAD_GAS)
    } catch {
      encoded = null
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <p className='text-sm text-muted-foreground'>
        All steps run in order inside one multisig transaction. A failed step is reported per-step and does not revert
        the others.
      </p>

      <datalist id='address-book-batch-targets'>
        {bookEntries.map((entry) => (
          <option key={entry.id} value={entry.address}>
            {entry.label}
          </option>
        ))}
      </datalist>

      {steps.map((step, i) => {
        const toInvalid = step.to.length > 0 && !isAddress(step.to)
        const knownLabel = isAddress(step.to) ? labelFor(step.to) : null
        return (
          <div key={i} className='flex flex-col gap-4 rounded-xl border border-border p-4'>
            <div className='flex items-center justify-between'>
              <h3 className='flex items-baseline gap-2 text-base font-semibold text-foreground'>
                <span className='font-mono text-sm text-primary'>{String(i + 1).padStart(2, '0')}</span>
                Step {i + 1}
              </h3>
              <Button
                variant='outline'
                size='icon'
                aria-label={`Remove step ${i + 1}`}
                onClick={() => removeStep(i)}
                disabled={steps.length === 1}
              >
                <DeleteIcon className='h-4 w-4' />
              </Button>
            </div>

            {field(
              'Send to',
              <TextInput
                className='font-mono md:w-full'
                placeholder='Receiver or contract address (0x...) — saved addresses will be suggested'
                value={step.to}
                list='address-book-batch-targets'
                isInvalid={toInvalid}
                spellCheck={false}
                autoComplete='off'
                onChange={(e) => updateStep(i, 'to', e.target.value.trim())}
              />,
              toInvalid
                ? undefined
                : knownLabel != null
                  ? undefined
                  : 'The address this step calls or sends funds to.'
            )}
            {toInvalid && <span className='-mt-3 text-xs text-destructive'>This is not a valid address</span>}
            {knownLabel != null && (
              <span className='-mt-3 text-xs text-muted-foreground'>
                Known as <span className='font-semibold text-foreground'>{knownLabel}</span> in your address book.
              </span>
            )}

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {field(
                'Value (wei)',
                <TextInput
                  className='md:w-full'
                  placeholder='0'
                  value={step.value}
                  isInvalid={step.value !== '' && !isUint(step.value)}
                  onChange={(e) => updateStep(i, 'value', e.target.value.trim())}
                />,
                'Native currency sent with this step. Leave 0 for a plain call.'
              )}
              {field(
                'Gas limit',
                <TextInput
                  className='md:w-full'
                  placeholder='35000'
                  value={step.txnGas}
                  isInvalid={step.txnGas !== '' && !isUint(step.txnGas)}
                  onChange={(e) => updateStep(i, 'txnGas', e.target.value.trim())}
                />,
                'Gas forwarded to this step.'
              )}
            </div>

            {field(
              'Calldata',
              <TextInput
                className='font-mono md:w-full'
                placeholder='0x'
                value={step.data}
                isInvalid={!isHex(step.data)}
                spellCheck={false}
                autoComplete='off'
                onChange={(e) => updateStep(i, 'data', e.target.value.trim())}
              />,
              'Leave 0x to just send value. To call a function, paste its encoded calldata.'
            )}
          </div>
        )
      })}

      <div className='flex flex-wrap items-center justify-between gap-2'>
        <Button variant='outline' className='gap-2' onClick={addStep}>
          <AddIcon className='h-4 w-4' />
          Add step
        </Button>
        <span className='font-mono text-xs text-muted-foreground'>
          {steps.length} step{steps.length === 1 ? '' : 's'} · {totalStepGas.toLocaleString()} gas +{' '}
          {BATCH_OVERHEAD_GAS.toLocaleString()} batch overhead
        </span>
      </div>

      <div className='flex flex-col gap-4 rounded-xl border border-border p-4'>
        <h3 className='text-base font-semibold text-foreground'>Request details</h3>
        {field(
          'Description',
          <TextInput
            className='md:w-full'
            placeholder='What is this request for? Other owners will see this.'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        )}
      </div>

      {ready && encoded != null ? (
        <div className='flex justify-end'>
          <SignRequest
            multiSigAddress={multiSigAddress}
            description={description}
            args={{
              to: multiSigAddress,
              value: '0',
              data: encoded,
              txnGas: outerGas,
              signatures: '',
              ...(txnNonce != null && txnNonce !== '' ? { txnNonce } : {}),
              batchSteps: steps
            }}
          />
        </div>
      ) : (
        <p className='text-center text-xs text-muted-foreground'>
          {firstInvalidIndex !== -1
            ? `Step ${firstInvalidIndex + 1} ${stepError(steps[firstInvalidIndex])}.`
            : 'Add a description so the other owners know what this batch does.'}
        </p>
      )}
    </div>
  )
}

export default BatchRequestForm
