import React from 'react'
import { AppProps } from 'next/app'
import { ArcxAnalyticsProvider } from '@arcxmoney/analytics'
import { ChakraProvider } from '@chakra-ui/react'
import { ColorModeScript } from '@chakra-ui/color-mode'

import Header from '../config'
import Web3Provider from '../components/web3/Web3Provider'
import theme from '../styles/theme'
import Layout from '../components/dom/Layout'

const App: React.FC<AppProps> = ({ Component, pageProps = { title: 'MyMultiSig' } }) => {
  return (
    <ArcxAnalyticsProvider apiKey={process.env.NEXT_PUBLIC_ARCX_API_KEY || ''}>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <Header title={pageProps.title} />
        <Web3Provider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </Web3Provider>
      </ChakraProvider>
    </ArcxAnalyticsProvider>
  )
}

export default App
