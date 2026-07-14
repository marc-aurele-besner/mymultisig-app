import React, { useState } from 'react'
import { encodeFunctionData, Abi } from 'viem'
import { Button } from '@/components/ui/button'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'

import TextInput from '../inputs/TextInput'
import SignRequest from '../buttons/SignRequest'
import { AddIcon, DeleteIcon } from '../icons/ChakraIcons'
import { BatchStep } from '../../models/MultiSigs'

interface BatchRequestFormProps {
  multiSigAddress: `0x${string}`
  txnNonce?: string
}

const EMPTY_STEP: BatchStep = { to: '0x' as `0x${string}`, value: '0', data: '0x' as `0x${string}`, txnGas: '35000' }
// Gas consumed by the multiRequest loop itself, on top of the inner calls.
const BATCH_OVERHEAD_GAS = 50000

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)
const isUint = (value: string) => /^\d+$/.test(value)
const isHex = (value: string) => /^0x[a-fA-F0-9]*$/.test(value)

// Builds a single multisig transaction that self-calls
// multiRequest(address[],uint256[],bytes[],uint256[]). Steps execute in order;
// a failing step is recorded (MultiRequestExecuted) without reverting the rest.
const BatchRequestForm: React.FC<BatchRequestFormProps> = ({ multiSigAddress, txnNonce }) => {
  const [steps, setSteps] = useState<BatchStep[]>([{ ...EMPTY_STEP }, { ...EMPTY_STEP }])
  const [description, setDescription] = useState('')

  const updateStep = (index: number, key: keyof BatchStep, value: string) => {
    setSteps(steps.map((step, i) => (i === index ? { ...step, [key]: value } : step)))
  }
  const addStep = () => setSteps([...steps, { ...EMPTY_STEP }])
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index))

  const stepsValid =
    steps.length > 0 && steps.every((s) => isAddress(s.to) && isUint(s.value) && isUint(s.txnGas) && isHex(s.data))
  const ready = stepsValid && description !== ''

  let encoded: `0x${string}` | null = null
  let outerGas = '0'
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
      outerGas = String(steps.reduce((sum, s) => sum + Number(s.txnGas), BATCH_OVERHEAD_GAS))
    } catch {
      encoded = null
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <p className='px-2 text-sm text-muted-foreground'>
        All steps run inside one multisig transaction. A failed step is reported per-step and does not revert the
        others.
      </p>
      {steps.map((step, i) => (
        <div key={i} className='flex flex-col gap-2 rounded-lg border border-border p-3'>
          <div className='flex items-center justify-between'>
            <span className='font-semibold text-foreground'>Step {i + 1}</span>
            <Button variant='outline' size='icon' aria-label='Remove step' onClick={() => removeStep(i)}>
              <DeleteIcon className='h-4 w-4' />
            </Button>
          </div>
          <TextInput
            placeholder='Target address (0x...)'
            value={step.to}
            onChange={(e) => updateStep(i, 'to', e.target.value)}
          />
          <div className='flex flex-wrap gap-2'>
            <TextInput
              placeholder='Value (wei)'
              value={step.value}
              onChange={(e) => updateStep(i, 'value', e.target.value)}
            />
            <TextInput
              placeholder='Gas'
              value={step.txnGas}
              onChange={(e) => updateStep(i, 'txnGas', e.target.value)}
            />
          </div>
          <TextInput
            placeholder='Calldata (0x for a plain transfer)'
            value={step.data}
            onChange={(e) => updateStep(i, 'data', e.target.value)}
          />
        </div>
      ))}
      <Button variant='outline' className='gap-2 self-start' onClick={addStep}>
        <AddIcon className='h-4 w-4' />
        Add step
      </Button>
      <TextInput placeholder='Description' value={description} onChange={(e) => setDescription(e.target.value)} />
      {ready && encoded != null && (
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
      )}
    </div>
  )
}

export default BatchRequestForm
