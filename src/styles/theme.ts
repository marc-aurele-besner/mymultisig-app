import { extendTheme, defineStyleConfig, type ThemeConfig } from '@chakra-ui/react'
import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools'
import { cardColors } from './colors'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true
}

const theme = extendTheme({
  config,
  styles: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    colors: (props: Record<string, any> | StyleFunctionProps) => ({
      cardBack: {
        100: mode('gray.100', 'gray.900')(props),
        200: mode('gray.200', 'gray.800')(props),
        300: mode('gray.300', 'gray.700')(props),
        400: mode('gray.400', 'gray.600')(props),
        500: mode('gray.500', 'gray.500')(props),
        600: mode('gray.600', 'gray.400')(props),
        700: mode('gray.700', 'gray.300')(props),
        800: mode('gray.800', 'gray.200')(props),
        900: mode('gray.900', 'gray.100')(props)
      },
      brandText: {
        100: mode('gray.900', 'gray.100')(props),
        200: mode('gray.800', 'gray.200')(props),
        300: mode('gray.700', 'gray.300')(props),
        400: mode('gray.600', 'gray.400')(props),
        500: mode('gray.500', 'gray.500')(props),
        600: mode('gray.400', 'gray.600')(props),
        700: mode('gray.300', 'gray.700')(props),
        800: mode('gray.200', 'gray.800')(props),
        900: mode('gray.100', 'gray.900')(props)
      },
      ...props
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global: (props: Record<string, any> | StyleFunctionProps) => ({
      'html, body': {
        bgGradient: mode(['linear(to-t, gray.400, gray.200)'], ['linear(to-t, gray.900, gray.700)'])(props),
        color: mode('#000000', '#ffffff')(props),
        fontSize: 'sm',
        lineHeight: 'tall',
        fontFamily: 'Roboto, sans-serif',
        height: 'fit-content',
        minHeight: '100vh'
      },
      a: {
        color: mode('#000000', '#ffffff')(props),
        _hover: {
          textDecoration: 'underline'
        }
      }
    })
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components: {
    Card: defineStyleConfig({
      baseStyle: {
        borderRadius: 10,
        fontSize: 'sm',
        ...cardColors
      },
      sizes: {
        sm: {
          fontSize: 'sm'
        },
        md: {
          fontSize: 'md'
        }
      },
      defaultProps: {
        size: 'md'
      }
    })
  }
})

export default theme
