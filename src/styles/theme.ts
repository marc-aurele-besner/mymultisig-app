import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
}

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bgGradient: [
          'linear(to-tr, teal.300, yellow.400)',
          'linear(to-t, blue.200, teal.500)',
          'linear(to-b, orange.100, cyan.300)',
        ],
        color: '#000000',
        fontFamily: 'Roboto, sans-serif',
        height: '100vh',
      },
    },
  },
})

export default theme
