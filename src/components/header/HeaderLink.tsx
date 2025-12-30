import Link from 'next/link'
import React from 'react'
import { HStack, Text, Image, Box } from '@chakra-ui/react'
import { linkColors } from '../../styles/colors'

interface HeaderLinkProps {
  name: string
  link: string
  imagePath?: string
  icon?: React.ReactElement
}

const HeaderLink: React.FC<HeaderLinkProps> = ({ name, link, imagePath, icon }) => {
  return (
    <Link key={`Link-${link}`} href={link}>
      <HStack
        border={'1px solid transparent'}
        _hover={{
          border: '1px solid',
          borderColor: 'blue.300',
          borderRadius: '12px',
          transform: 'translateY(-2px)',
          transition: 'all 200ms ease-out'
        }}
        p='0.2rem'
        ml='1rem'>
        {icon ? <Box as='span' lineHeight='0'>{icon}</Box> : imagePath ? <Image src={imagePath} alt={name} h='2rem' /> : null}
        <Text key={`LinkText-${link}`} fontSize='lg' fontWeight='bold' {...linkColors}>
          {name}
        </Text>
      </HStack>
    </Link>
  )
}

export default HeaderLink
