import React from 'react'
import { Center, VStack, Text, Heading, Stack, Button, Link as ChakraLink } from '@chakra-ui/react'
import Link from 'next/link'
import { AddIcon, CheckCircleIcon, ExternalLinkIcon } from '@chakra-ui/icons'

import BigCard from '../cards/BigCard'
import { textColors, buttonColors } from '../../styles/colors'

const About: React.FC = () => {
  return (
    <Center>
      <BigCard maxW='1200px' minH='50vh'>
        <Center>
          <VStack spacing={{ base: 4, md: 6 }} w='100%'>
            <Heading
              as='h1'
              textAlign='center'
              fontSize={{ base: '3xl', md: '5xl' }}
              fontWeight='extrabold'
              bgGradient='linear(to-r, blue.500, blue.300)'
              bgClip='text'
            >
              About MyMultiSig.app
            </Heading>

            <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight='bold' textAlign='center' px={{ base: 4, md: 12 }} {...textColors}>
              MyMultiSig is a minimalistic, open-source multisig smart contract and web app focused on security, simplicity, and auditability.
            </Text>
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight='medium' textAlign='center' px={{ base: 4, md: 12 }} {...textColors}>
              Create a multisig, manage signers, and approve transactions with a clean UI. The contracts are designed to be easy to read and verify, making audits straightforward.
            </Text>

            <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} pt={{ base: 2, md: 4 }}>
              <ChakraLink as={Link} href='/createMultiSig' _hover={{ textDecoration: 'none' }}>
                <Button leftIcon={<AddIcon />} {...buttonColors}>
                  Create a MultiSig
                </Button>
              </ChakraLink>
              <ChakraLink as={Link} href='/useYourMultiSig' _hover={{ textDecoration: 'none' }}>
                <Button leftIcon={<CheckCircleIcon />} variant='outline' colorScheme='blue'>
                  Use your MultiSig
                </Button>
              </ChakraLink>
              <ChakraLink as={Link} href='https://github.com/marc-aurele-besner/mymultisig-contract' target='_blank' _hover={{ textDecoration: 'none' }}>
                <Button leftIcon={<ExternalLinkIcon />} variant='ghost' colorScheme='blue'>
                  View Smart Contracts
                </Button>
              </ChakraLink>
            </Stack>

            <VStack spacing={2} pt={{ base: 4, md: 6 }} px={{ base: 4, md: 12 }}>
              <Text fontSize='md' textAlign='center' {...textColors}>
                - Lightweight contracts, clear logic, no unnecessary complexity
              </Text>
              <Text fontSize='md' textAlign='center' {...textColors}>
                - Gas-conscious design with an emphasis on security best practices
              </Text>
              <Text fontSize='md' textAlign='center' {...textColors}>
                - Built with Next.js and Chakra UI for a responsive UX
              </Text>
            </VStack>
          </VStack>
        </Center>
      </BigCard>
    </Center>
  )
}

export default About