import Link from 'next/link'
import React from 'react'
import { HStack, Text, Box } from '@chakra-ui/react'

interface HeaderLinkProps {
  name: string
  link: string
  imagePath?: string
  icon?: React.ReactElement
  isLogo?: boolean
}

const HeaderLink: React.FC<HeaderLinkProps> = ({ name, link, icon, isLogo }) => {
  return (
    <Link key={`Link-${link}`} href={link}>
      <HStack
        px={isLogo ? 2 : 3}
        py={2}
        borderRadius='lg'
        spacing={2}
        sx={{ transition: 'all 0.2s ease' }}
        bg='transparent'
        _hover={{
          bg: isLogo ? 'transparent' : 'whiteAlpha.100',
          transform: isLogo ? 'scale(1.02)' : 'translateY(-1px)'
        }}
      >
        {icon && (
          <Box
            as='span'
            color={isLogo ? 'brand.400' : 'whiteAlpha.700'}
            sx={{ transition: 'color 0.2s ease' }}
            _groupHover={{ color: 'brand.300' }}
          >
            {icon}
          </Box>
        )}
        <Text
          fontSize={isLogo ? 'lg' : 'sm'}
          fontWeight={isLogo ? '700' : '500'}
          color={isLogo ? 'white' : 'whiteAlpha.800'}
          bgGradient={isLogo ? 'linear(to-r, brand.300, accent.400)' : undefined}
          bgClip={isLogo ? 'text' : undefined}
          sx={{ transition: 'color 0.2s ease' }}
          _hover={{
            color: isLogo ? undefined : 'white'
          }}
        >
          {name}
        </Text>
      </HStack>
    </Link>
  )
}

export default HeaderLink
