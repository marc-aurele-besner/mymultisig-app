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
        bg: '#FFFFFF',
        color: '#000000',
        fontFamily: 'Roboto, sans-serif',
      },
    },
  },
})

export default theme
