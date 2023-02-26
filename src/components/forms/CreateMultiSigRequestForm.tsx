import React, { useState } from 'react'
import { Box, Button, Center, HStack, Text } from '@chakra-ui/react'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'

import SelectContract from '../inputs/SelectContract'
import SelectFunction from '../inputs/SelectFunction'
import TextInput from '../inputs/TextInput'
import SignRequest from '../buttons/SignRequest'

interface CreateMultiSigRequestFormProps {
  multiSigAddress: `0x${string}`
}

const CreateMultiSigRequestForm: React.FC<CreateMultiSigRequestFormProps> = ({ multiSigAddress }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [abi, setAbi] = useState<any[] | undefined>(undefined)
  const [type, setType] = useState<string>('contract')
  const [selectedContract, setSelectedContract] = useState<string | undefined>(undefined)
  const [selectedFunction, setSelectedFunction] = useState<string | undefined>(undefined)

  return (
    <>
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
              <SelectContract onChange={(e) => setSelectedContract(e)} />
            </HStack>
            <HStack>
              <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
                Function to call:
              </Text>
              <SelectFunction
                abi={selectedContract == 'itSelf' ? MyMultiSig : []}
                onChange={(e) => {
                  setSelectedFunction(e)
                  if (selectedContract == 'itSelf') setAbi(MyMultiSig)
                  else setAbi(undefined)
                }}
              />
            </HStack>
            {abi &&
              abi.find((item) => item.name == selectedFunction) &&
              abi.find((item) => item.name == selectedFunction).inputs.length > 0 && (
                <>
                  <HStack>
                    <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
                      Arguments
                    </Text>
                  </HStack>
                  {abi
                    .find((item) => item.name == selectedFunction)
                    .inputs.map((item: { name: string }) => (
                      <HStack key={`Argument-${item.name}`}>
                        <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
                          {item.name}:
                        </Text>
                        <TextInput placeholder={item.name} onChange={(e) => console.log('argument', item.name, e)} />
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
            <TextInput placeholder={'Receiver'} onChange={(e) => console.log('receiver', e)} />
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
          <TextInput placeholder={'Value'} onChange={(e) => console.log('Value', e)} />
        </HStack>
        <HStack>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Tx. Gas:
          </Text>
          <TextInput placeholder={'Tx. Gas'} onChange={(e) => console.log('Tx. Gas', e)} />
        </HStack>
        <HStack>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Description:
          </Text>
          <TextInput placeholder={'Description'} onChange={(e) => console.log('Description', e)} />
        </HStack>
        <Center>
          <SignRequest
            multiSigAddress={multiSigAddress}
            args={{
              to: multiSigAddress,
              value: '0',
              data: '0x',
              txnGas: '35000',
              signatures: ''
            }}
          />
        </Center>
      </Box>
    </>
  )
}

export default CreateMultiSigRequestForm
