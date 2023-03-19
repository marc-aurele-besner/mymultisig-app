import React, { useState } from 'react'
import { Box, Button, Center, HStack, Text } from '@chakra-ui/react'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'
import { JsonFragment } from '@ethersproject/abi'

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

const CreateMultiSigRequestForm: React.FC<CreateMultiSigRequestFormProps> = ({ multiSigAddress }) => {
  const [abi, setAbi] = useState<JsonFragment[] | null>(null)
  const [request, setRequest] = useState<BuildMultiSigRequest>({
    to: `0x`,
    value: '0',
    txnGas: '0',
    description: '',
    arguments: {}
  })
  const [type, setType] = useState<string>('contract')
  const [selectedContract, setSelectedContract] = useState<string | undefined>(undefined)
  const [selectedFunction, setSelectedFunction] = useState<string>('')
  const contracts = useContracts((state) => state.contracts)
  const callData = useCallData(abi, selectedFunction, request.to, request.arguments)

  const selectedFunctionFragment =
    abi && selectedFunction && abi.find((item) => buildRawSignatureFromFunction(item) == selectedFunction)

  const handleChangeContract = (e: string) => {
    if (e == 'itSelf') {
      setAbi(MyMultiSig)
      handleChangeValue(multiSigAddress, 'to')
    } else {
      const contract = contracts.find((contract) => contract.id == e)
      if (contract) {
        setAbi(contract.abi)
        handleChangeValue(contract.address, 'to')
      }
    }
    setSelectedContract(e)
  }

  const handleChangeValue = (e: string, key: string, argumentKey?: string) => {
    if (key == 'arguments' && argumentKey) {
      const newArguments = { ...request.arguments, [argumentKey]: e }
      setRequest({ ...request, [key]: newArguments })
    } else setRequest({ ...request, [key]: e })
  }
  const clearArguments = () => {
    setRequest({ ...request, arguments: {} })
  }

  return (
    <>
      {selectedContract == 'newContract' && <NewContract />}
      <Box border='1px' borderColor='white' borderRadius='5px' p='1rem'>
        <HStack>
          <Button colorScheme='blue' m='1rem' mr='2rem' onClick={() => setType('contract')}>
            Call a contract
          </Button>
          <Button colorScheme='blue' m='1rem' mr='2rem' onClick={() => setType('tx')}>
            Regular transaction
          </Button>
        </HStack>
        {type === 'contract' ? (
          <>
            <HStack>
              <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
                Contract to call:
              </Text>
              <SelectContract onChange={(e) => handleChangeContract(e)} />
            </HStack>
            <HStack>
              <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
                Function to call:
              </Text>
              <SelectFunction
                abi={selectedContract == 'itSelf' ? MyMultiSig : abi}
                onChange={(e) => {
                  clearArguments()
                  setSelectedFunction(e)
                }}
              />
            </HStack>
            {selectedFunctionFragment &&
              selectedFunctionFragment.inputs &&
              selectedFunctionFragment.inputs.length > 0 && (
                <>
                  <HStack>
                    <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
                      Arguments
                    </Text>
                  </HStack>
                  {selectedFunctionFragment.inputs.map((item: JsonFragment) => (
                    <HStack key={`Argument-${item.name}`}>
                      <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
                        {item.name}:
                      </Text>
                      <TextInput
                        placeholder={`${item.name}`}
                        onChange={(e) => handleChangeValue(e.target.value, 'arguments', item.name)}
                      />
                    </HStack>
                  ))}
                </>
              )}
          </>
        ) : (
          <HStack>
            <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
              Receiver:
            </Text>
            <TextInput placeholder={'Receiver'} onChange={(e) => handleChangeValue(e.target.value, 'to')} />
          </HStack>
        )}
        <HStack>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Tx. Detail
          </Text>
        </HStack>
        <HStack>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Value:
          </Text>
          <TextInput placeholder={'Value'} onChange={(e) => handleChangeValue(e.target.value, 'value')} />
        </HStack>
        <HStack>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Tx. Gas:
          </Text>
          <TextInput placeholder={'Tx. Gas'} onChange={(e) => handleChangeValue(e.target.value, 'txnGas')} />
        </HStack>
        <HStack>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Description:
          </Text>
          <TextInput placeholder={'Description'} onChange={(e) => handleChangeValue(e.target.value, 'description')} />
        </HStack>
        <Center>
          <SignRequest
            multiSigAddress={multiSigAddress}
            description={request.description}
            args={{
              to: request.to,
              value: request.value,
              data: callData.callData ? `0x${callData.callData?.substring(2)}` : '0x',
              txnGas: request.txnGas,
              signatures: ''
            }}
          />
        </Center>
      </Box>
    </>
  )
}

export default CreateMultiSigRequestForm
