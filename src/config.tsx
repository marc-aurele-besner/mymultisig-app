import Head from 'next/head'

const titleDefault = 'MyMultiSig'
const url = 'https://mymultisig.app/'
const description = 'A simple and easy MultiSig wallet for Ethereum and other EVMs networks'
const author = 'Marc-Aurele Besner'

const Header = ({ title = titleDefault }) => {
  return (
    <Head>
      {/* Recommended Meta Tags */}
      <meta charSet='utf-8' />
      <meta name='language' content='english' />
      <meta httpEquiv='content-type' content='text/html' />
      <meta name='author' content={author} />
      <meta name='designer' content={author} />
      <meta name='publisher' content={author} />

      {/* Search Engine Optimization Meta Tags */}
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content='nextjs,react,typescript,web3,ethereum,multisig,wallet,dapp' />
      <meta name='robots' content='index,follow' />
      <meta name='distribution' content='web' />
      <meta name='og:title' content={title} />
      <meta name='og:type' content='website' />
      <meta name='og:url' content={url} />
      <meta name='og:image' content={`${url}favicon/web-app-manifest-512x512.png`} />
      <meta name='og:site_name' content={title} />
      <meta name='og:description' content={description} />

      <link rel='icon' type='image/svg+xml' href='/favicon/favicon.svg' />
      <link rel='icon' type='image/png' sizes='96x96' href='/favicon/favicon-96x96.png' />
      <link rel='apple-touch-icon' sizes='180x180' href='/favicon/apple-touch-icon.png' />
      <link rel='manifest' href='/favicon/site.webmanifest' />

      {/* Meta Tags for HTML pages on Mobile */}
      <meta name='format-detection' content='telephone=yes' />
      <meta name='HandheldFriendly' content='true' />
      <meta name='viewport' content='width=device-width, minimum-scale=1, initial-scale=1.0' />
      <meta name='theme-color' content='#100c0a' />
      <link rel='shortcut icon' href='/favicon/favicon.ico' />

      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:site' content='@marcaureleb' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={`${url}favicon/web-app-manifest-512x512.png`} />
    </Head>
  )
}

export default Header
