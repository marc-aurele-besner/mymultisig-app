import React from 'react'
import { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { ColorModeScript } from '@chakra-ui/color-mode'

import Header from '../config'
import Web3Provider from '../components/web3/Web3Provider'
import theme from '../styles/theme'
import Layout from '../components/dom/Layout'

const App: React.FC<AppProps> = ({ Component, pageProps = { title: 'MyMultiSig' } }) => {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode='light' />
      <Header title={pageProps.title} />
      <Web3Provider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Web3Provider>
    </ChakraProvider>
  )
}

export default App
