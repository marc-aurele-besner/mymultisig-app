import React from 'react'
import { Center, VStack, Text, Box, Code, Link as ChakraLink, List, ListItem } from '@chakra-ui/react'

import BigCard from '../cards/BigCard'

const Integration: React.FC = () => {
  return (
    <Center>
      <BigCard maxW='1200px' minH='50vh'>
        <Center>
          <VStack>
            <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
              Integration
            </Text>
            <Text fontSize='md' color='white' textAlign='center'>
              Programmatically create, query, update, and delete MultiSig requests via signed API calls.
            </Text>

            <Box w='100%' mt='2rem'>
              <Text fontSize='xl' fontWeight='bold' color='white' mb='0.5rem'>
                Prerequisites
              </Text>
              <List spacing={1} pl='1rem' styleType='disc'>
                <ListItem>
                  <Text color='white'>Wallet connected and chain selected in the app</Text>
                </ListItem>
                <ListItem>
                  <Text color='white'>Backend env configured: <Code>FAUNADB_SERVER_SECRET</Code>, <Code>PRIVATE_KEY</Code>, <Code>RPC_ETHEREUM</Code></Text>
                </ListItem>
              </List>
            </Box>

            <Box w='100%' mt='2rem'>
              <Text fontSize='xl' fontWeight='bold' color='white' mb='0.5rem'>
                Flow overview
              </Text>
              <List spacing={1} pl='1rem' styleType='decimal'>
                <ListItem>
                  <Text color='white'>Build an EIP‑712 style payload client-side with <Code>signData</Code></Text>
                </ListItem>
                <ListItem>
                  <Text color='white'>Call the appropriate API with the signed message via <Code>getContent</Code>, <Code>addContent</Code>, <Code>updateContent</Code>, or <Code>deleteContent</Code></Text>
                </ListItem>
                <ListItem>
                  <Text color='white'>Use returned content to render requests or proceed to execution</Text>
                </ListItem>
              </List>
            </Box>

            <Box w='100%' mt='2rem'>
              <Text fontSize='xl' fontWeight='bold' color='white' mb='0.5rem'>
                Client helpers
              </Text>
              <Text color='white' mb='0.5rem'>
                Import helpers from <Code>src/utils</Code>:
              </Text>
              <Code w='100%' p='0.75rem' whiteSpace='pre-wrap'>
{`import { signData, getContent, addContent, updateContent, deleteContent } from '../utils'`}
              </Code>
            </Box>

            <Box w='100%' mt='2rem'>
              <Text fontSize='xl' fontWeight='bold' color='white' mb='0.5rem'>
                Create a MultiSig Request
              </Text>
              <Text color='white'>
                Action: <Code>addMultiSigRequest</Code> • Collection: <Code>multisig-requests</Code>
              </Text>
              <Code w='100%' p='0.75rem' mt='0.5rem' whiteSpace='pre-wrap'>
{`signData({
  action: 'addMultiSigRequest',
  chainId: chain.id,
  collection: 'multisig-requests',
  data: {
    id: 'REQ-123',
    multiSigAddress: '0x...',
    request: { to: '0x...', value: '0', data: '0x', txnGas: '0', signatures: '0x' },
    description: 'Transfer 1 ETH to Treasury',
    submitter: address,
    signatures: [], ownerSigners: [],
    dateSubmitted: new Date().toISOString(),
    dateExecuted: '',
    isActive: true, isExecuted: false, isCancelled: false, isConfirmed: false, isSuccessful: false
  },
  details: 'Add MultiSig Request',
  signatureExpiry: 0
}).then(({ message }) => addContent(message))`}
              </Code>
            </Box>

            <Box w='100%' mt='2rem'>
              <Text fontSize='xl' fontWeight='bold' color='white' mb='0.5rem'>
                Query Requests
              </Text>
              <Text color='white'>
                Actions: <Code>getMultiSigRequests</Code>, <Code>getMultiSigRequestById</Code>
              </Text>
              <Code w='100%' p='0.75rem' mt='0.5rem' whiteSpace='pre-wrap'>
{`// By MultiSig address
signData({
  action: 'getMultiSigRequests',
  chainId: chain.id,
  collection: 'multisig-requests',
  data: { multiSigAddress },
  details: 'Get MultiSig Request',
  signatureExpiry: 0
}).then(({ message }) => getContent(message))

// By Request ID
signData({
  action: 'getMultiSigRequestById',
  chainId: chain.id,
  collection: 'multisig-requests',
  data: { multiSigRequestId: 'REQ-123' },
  details: 'Get MultiSig Request By ID',
  signatureExpiry: 0
}).then(({ message }) => getContent(message))`}
              </Code>
            </Box>

            <Box w='100%' mt='2rem'>
              <Text fontSize='xl' fontWeight='bold' color='white' mb='0.5rem'>
                Update or Reset a Request
              </Text>
              <Text color='white'>
                Actions: <Code>updateMultiSigRequest</Code>, <Code>resetMultiSigRequest</Code>
              </Text>
              <Code w='100%' p='0.75rem' mt='0.5rem' whiteSpace='pre-wrap'>
{`signData({
  action: 'updateMultiSigRequest',
  chainId: chain.id,
  collection: 'multisig-requests',
  data: { id: 'REQ-123', signatures: [...], isConfirmed: true },
  details: 'Update MultiSig Request',
  signatureExpiry: 0
}).then(({ message }) => updateContent(message, 'REQ-123'))

signData({
  action: 'resetMultiSigRequest',
  chainId: chain.id,
  collection: 'multisig-requests',
  data: { id: 'REQ-123', signatures: [], isConfirmed: false },
  details: 'Reset MultiSig Request',
  signatureExpiry: 0
}).then(({ message }) => updateContent(message, 'REQ-123'))`}
              </Code>
            </Box>

            <Box w='100%' mt='2rem' mb='1rem'>
              <Text fontSize='xl' fontWeight='bold' color='white' mb='0.5rem'>
                Delete a Request
              </Text>
              <Text color='white'>
                Action: <Code>deleteMultiSigRequest</Code> • Pass the existing document ref
              </Text>
              <Code w='100%' p='0.75rem' mt='0.5rem' whiteSpace='pre-wrap'>
{`signData({
  action: 'deleteMultiSigRequest',
  chainId: chain.id,
  collection: 'multisig-requests',
  data: { existingRequestRef: 'REQ-123' },
  details: 'Delete MultiSig Request',
  signatureExpiry: 0
}).then(({ message }) => deleteContent(message, 'REQ-123'))`}
              </Code>
            </Box>

            <Box w='100%' mt='2rem' mb='1rem'>
              <Text fontSize='xl' fontWeight='bold' color='white' mb='0.5rem'>
                Endpoints
              </Text>
              <List spacing={1} pl='1rem' styleType='disc'>
                <ListItem><Text color='white'><Code>/api/signData</Code> — UI signature helper</Text></ListItem>
                <ListItem><Text color='white'><Code>/api/get-content</Code> — query content (Fauna)</Text></ListItem>
                <ListItem><Text color='white'><Code>/api/add-content</Code> — create content</Text></ListItem>
                <ListItem><Text color='white'><Code>/api/update-content/[id]</Code> — update content by document id</Text></ListItem>
                <ListItem><Text color='white'><Code>/api/delete-content/[id]</Code> — delete content by document id</Text></ListItem>
                <ListItem><Text color='white'><Code>/api/getABI</Code> — fetch contract ABI via Etherscan</Text></ListItem>
                <ListItem><Text color='white'><Code>/api/verify</Code> — verify contract on Etherscan</Text></ListItem>
              </List>
            </Box>

            <Text fontSize='sm' color='white'>
              See also: <ChakraLink href='https://storybook.mymultisig.app' isExternal color='blue.300'>Storybook</ChakraLink>
            </Text>
          </VStack>
        </Center>
      </BigCard>
    </Center>
  )
}

export default Integration
