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
      // Re-use the same keys but map them to a brighter palette
      cardBack: {
        100: mode('teal.100', 'teal.800')(props),
        200: mode('teal.200', 'teal.900')(props),
        300: mode('cyan.300', 'cyan.800')(props),
        400: mode('blue.400', 'blue.800')(props),
        500: mode('purple.500', 'purple.800')(props),
        600: mode('pink.600', 'pink.700')(props),
        700: mode('purple.700', 'purple.900')(props),
        800: mode('blue.700', 'purple.900')(props),
        900: mode('pink.600', 'pink.900')(props)
      },
      brandText: {
        100: mode('gray.900', 'whiteAlpha.900')(props),
        200: mode('gray.800', 'whiteAlpha.800')(props),
        300: mode('gray.700', 'whiteAlpha.800')(props),
        400: mode('gray.600', 'whiteAlpha.700')(props),
        500: mode('gray.600', 'whiteAlpha.800')(props),
        600: mode('gray.700', 'whiteAlpha.900')(props),
        700: mode('gray.800', 'white')(props),
        800: mode('gray.900', 'white')(props),
        900: mode('black', 'white')(props)
      },
      ...props
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global: (props: Record<string, any> | StyleFunctionProps) => ({
      'html, body': {
        bgGradient: mode(
          'linear(to-br, teal.200, purple.300, pink.200)',
          'linear(to-br, teal.900, purple.900, pink.900)'
        )(props),
        color: mode('#0b1020', '#ffffff')(props),
        fontSize: 'sm',
        lineHeight: 'tall',
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji',
        height: 'fit-content',
        minHeight: '100vh'
      },
      a: {
        color: mode('#0b1020', '#ffffff')(props),
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
        borderRadius: 16,
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
