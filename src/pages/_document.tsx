import { Html, Head, Main, NextScript } from 'next/document'

// lang on <html> tells crawlers, screen readers and translation tools the
// language of every page. Per-page metadata lives in src/config.tsx.
const Document = () => {
  return (
    <Html lang='en'>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

export default Document
