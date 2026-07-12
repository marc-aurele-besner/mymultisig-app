import React, { Fragment, useState } from 'react'
import MyMultiSig from '../../constants/abi/MyMultiSig.json'
import { JsonFragment } from '@ethersproject/abi'
import { Button } from '@/components/ui/button'

import SelectContract from '../inputs/SelectContract'
import SelectFunction from '../inputs/SelectFunction'
import TextInput from '../inputs/TextInput'
import SignRequest from '../buttons/SignRequest'
import NewContract from '../modals/NewContract'
import useContracts from '../../states/contracts'
import useCallData from '../../hooks/useCallData'
import { BuildMultiSigRequest } from '../../models/MultiSigs'
import { buildRawSignatureFromFunction } from '../../utils/buildFunctionSignature'

interface CreateMultiSigRequestFormProps {
  multiSigAddress: `0x${string}`
}

const CreateMultiSigRequestForm: React.FC<CreateMultiSigRequestFormProps> = ({
  multiSigAddress
}) => {
  const [abi, setAbi] = useState<JsonFragment[] | null>(null)
  const [request, setRequest] = useState<BuildMultiSigRequest>({
    to: '0x',
    value: '0',
    txnGas: '35000',
    description: '',
    arguments: {}
  })
  const [type, setType] = useState<string>('contract')
  const [selectedContract, setSelectedContract] = useState<string | undefined>(undefined)
  const [selectedFunction, setSelectedFunction] = useState<string>('')
  const contracts = useContracts((state) => state.contracts)
  const callData = useCallData(abi, selectedFunction, request.to, request.arguments)

  const selectedFunctionFragment: JsonFragment | undefined =
    abi != null && selectedFunction
      ? abi.find((item) => buildRawSignatureFromFunction(item) === selectedFunction)
      : undefined

  const handleChangeContract = (e: string) => {
    if (e === 'itSelf') {
      setAbi(MyMultiSig as JsonFragment[])
      handleChangeValue(multiSigAddress, 'to')
    } else {
      const contract = contracts.find((c) => c.id === e)
      if (contract != null) {
        setAbi(contract.abi)
        handleChangeValue(contract.address, 'to')
      }
    }
    setSelectedContract(e)
  }

  const handleChangeValue = (e: string, key: string, argumentKey?: string) => {
    if (key === 'arguments' && argumentKey != null) {
      const newArguments = { ...request.arguments, [argumentKey]: e }
      setRequest({ ...request, [key]: newArguments })
    } else {
      setRequest({ ...request, [key]: e })
    }
  }
  const clearArguments = () => {
    setRequest({ ...request, arguments: {} })
  }

  const row = (label: string, children: React.ReactNode) => (
    <div key={label} className="flex flex-wrap items-center gap-2">
      <span className="px-2 pt-2 text-xl font-bold text-foreground">{label}</span>
      {children}
    </div>
  )

  return (
    <Fragment>
      {selectedContract === 'newContract' && <NewContract />}
      <div className="rounded-lg border border-border p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={type === 'contract' ? 'default' : 'outline'}
            className="m-2"
            onClick={() => setType('contract')}
          >
            Call a contract
          </Button>
          <Button
            variant={type === 'tx' ? 'default' : 'outline'}
            className="m-2"
            onClick={() => setType('tx')}
          >
            Regular transaction
          </Button>
        </div>
        {type === 'contract' ? (
          <Fragment>
            {row(
              'Contract to call:',
              <SelectContract onChange={(e) => handleChangeContract(e)} />
            )}
            {row(
              'Function to call:',
              <SelectFunction
                abi={selectedContract === 'itSelf' ? (MyMultiSig as JsonFragment[]) : abi}
                onChange={(e) => {
                  clearArguments()
                  setSelectedFunction(e)
                }}
              />
            )}
            {selectedFunctionFragment != null &&
              Array.isArray(selectedFunctionFragment.inputs) &&
              selectedFunctionFragment.inputs.length > 0 && (
                <>
                  <div className="px-2 pt-2 text-xl font-bold text-foreground">Arguments</div>
                  {selectedFunctionFragment.inputs.map((item: JsonFragment) => (
                    <div key={`Argument-${item.name}`} className="flex flex-wrap items-center gap-2">
                      <span className="px-2 pt-2 text-xl font-bold text-foreground">
                        {String(item.name)}:
                      </span>
                      <TextInput
                        placeholder={String(item.name)}
                        onChange={(e) =>
                          handleChangeValue(e.target.value, 'arguments', item.name as string)
                        }
                      />
                    </div>
                  ))}
                </>
              )}
          </Fragment>
        ) : (
          row(
            'Receiver:',
            <TextInput
              placeholder="Receiver"
              value={request.to}
              onChange={(e) => handleChangeValue(e.target.value, 'to')}
            />
          )
        )}
        <div className="px-2 pt-2 text-xl font-bold text-foreground">Tx. Detail</div>
        {row(
          'Value:',
          <TextInput
            placeholder="Value"
            value={request.value}
            onChange={(e) => handleChangeValue(e.target.value, 'value')}
          />
        )}
        {row(
          'Tx. Gas:',
          <TextInput
            placeholder="Tx. Gas"
            value={request.txnGas}
            onChange={(e) => handleChangeValue(e.target.value, 'txnGas')}
          />
        )}
        {row(
          'Description:',
          <TextInput
            placeholder="Description"
            value={request.description}
            onChange={(e) => handleChangeValue(e.target.value, 'description')}
          />
        )}
        {(type === 'tx'
          ? /^0x[a-fA-F0-9]{40}$/.test(request.to) && request.description !== ''
          : selectedContract != null && selectedFunction !== '' && request.description !== '') && (
          <div className="flex justify-center">
            <SignRequest
              multiSigAddress={multiSigAddress}
              description={request.description}
              args={{
                to: request.to,
                value: request.value,
                data:
                  type !== 'tx' && callData.callData != null
                    ? `0x${callData.callData.substring(2)}`
                    : '0x',
                txnGas: request.txnGas,
                signatures: ''
              }}
            />
          </div>
        )}
      </div>
    </Fragment>
  )
}

export default CreateMultiSigRequestForm
