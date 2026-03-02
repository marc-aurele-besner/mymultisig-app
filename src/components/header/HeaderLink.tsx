import Link from 'next/link'
import React from 'react'
import { HStack, Text, Box } from '@chakra-ui/react'
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@chakra-ui/form-control'
import { useColorModeValue } from '@chakra-ui/color-mode'

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
        gap={2}
      >
        {icon && (
          <Box
            as='span'
            color={isLogo ? brandColor : iconColor}
          >
            {icon}
          </Box>
        )}
        <Text
          fontSize={isLogo ? 'lg' : 'sm'}
          fontWeight={isLogo ? '700' : '500'}
          color={isLogo ? undefined : textColor}
          bgGradient={isLogo ? 'linear(to-r, brand.400, accent.500)' : undefined}
          bgClip={isLogo ? 'text' : undefined}
        >
          {name}
        </Text>
      </HStack>
    </Link>
  )
}

export default HeaderLink
