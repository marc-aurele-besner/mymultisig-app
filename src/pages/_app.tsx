import React from 'react'
import { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { ColorModeScript } from '@chakra-ui/color-mode'

import Header from '../config'
import theme from '../styles/theme'
import Layout from '../components/dom/Layout'

const App: React.FC<AppProps> = ({ Component, pageProps = { title: 'index' } }) => {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode='light' />
      <Header title={pageProps.title} />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  )
}

export default App
