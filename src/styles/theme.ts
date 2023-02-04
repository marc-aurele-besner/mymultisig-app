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
        bg: '#000000',
        color: '##FFFFFF',
        fontFamily: 'Roboto, sans-serif',
      },
    },
  },
})

export default theme
