import React from 'react'
import Script from 'next/script'
import { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

import '../styles/globals.css'
import Header from '../config'
import Web3Provider from '../components/web3/Web3Provider'
import Layout from '../components/dom/Layout'

const App: React.FC<AppProps> = ({ Component, pageProps = { title: 'MyMultiSig' } }) => {
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <Header title={pageProps.title} />
        <Web3Provider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </Web3Provider>
        <Toaster position="top-right" richColors closeButton />
      </ThemeProvider>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_APP_GTAG}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${process.env.NEXT_PUBLIC_APP_GTAG}');
        `}
      </Script>
    </>
  )
}

export default App
