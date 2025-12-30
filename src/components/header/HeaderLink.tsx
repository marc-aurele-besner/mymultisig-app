import Link from 'next/link'
import React from 'react'
import { HStack, Text, Box, useColorModeValue } from '@chakra-ui/react'

interface HeaderLinkProps {
  name: string
  link: string
  imagePath?: string
  icon?: React.ReactElement
  isLogo?: boolean
}

const HeaderLink: React.FC<HeaderLinkProps> = ({ name, link, icon, isLogo }) => {
  const hoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const iconColor = useColorModeValue('gray.500', 'whiteAlpha.700')
  const textColor = useColorModeValue('gray.700', 'whiteAlpha.800')
  const textHoverColor = useColorModeValue('gray.900', 'white')
  const brandColor = useColorModeValue('brand.600', 'brand.400')

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
          bg: isLogo ? 'transparent' : hoverBg,
          transform: isLogo ? 'scale(1.02)' : 'translateY(-1px)'
        }}>
        {icon && (
          <Box
            as='span'
            color={isLogo ? brandColor : iconColor}
            sx={{ transition: 'color 0.2s ease' }}
            _groupHover={{ color: brandColor }}>
            {icon}
          </Box>
        )}
        <Text
          fontSize={isLogo ? 'lg' : 'sm'}
          fontWeight={isLogo ? '700' : '500'}
          color={isLogo ? undefined : textColor}
          bgGradient={isLogo ? 'linear(to-r, brand.400, accent.500)' : undefined}
          bgClip={isLogo ? 'text' : undefined}
          sx={{ transition: 'color 0.2s ease' }}
          _hover={{
            color: isLogo ? undefined : textHoverColor
          }}>
          {name}
        </Text>
      </HStack>
    </Link>
  )
}

export default HeaderLink
