import Link from 'next/link'
import React from 'react'
import { HStack, Text, Image, Box } from '@chakra-ui/react'
import { linkColors } from '../../styles/colors'

interface FooterLinkProps {
  name: string
  link: string
  imagePath?: string
  target?: string
  icon?: React.ReactElement
}

const FooterLink: React.FC<FooterLinkProps> = ({ name, link, imagePath, target, icon }) => {
  return (
    <Link key={`Link-${link}`} href={link} target={target}>
      <HStack
        border={'1px solid transparent'}
        _hover={{
          border: '1px solid white',
          borderRadius: '10px'
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

export default FooterLink
