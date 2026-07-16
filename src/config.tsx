import Head from 'next/head'

const titleDefault = 'MyMultiSig'
const siteUrl = 'https://mymultisig.app'
const descriptionDefault = 'A simple and easy MultiSig wallet for Ethereum and other EVMs networks'
const author = 'Marc-Aurele Besner'
const ogImage = `${siteUrl}/images/og-image.png`

interface HeaderProps {
  title?: string
  description?: string
  /** Route path (e.g. '/about') — emits a canonical URL and matching og:url when set */
  path?: string
  /** Private/app pages set this so thin or duplicate URLs stay out of search results */
  noIndex?: boolean
}

const Header = ({ title = titleDefault, description = descriptionDefault, path, noIndex = false }: HeaderProps) => {
  const canonicalUrl = path != null ? `${siteUrl}${path === '/' ? '/' : path}` : undefined
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
      <meta name='robots' content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name='distribution' content='web' />
      {canonicalUrl && <link rel='canonical' href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property='og:title' content={title} />
      <meta property='og:type' content='website' />
      {canonicalUrl && <meta property='og:url' content={canonicalUrl} />}
      <meta property='og:image' content={ogImage} />
      <meta property='og:image:width' content='1200' />
      <meta property='og:image:height' content='630' />
      <meta property='og:image:alt' content='MyMultiSig — open-source multisig wallet for Ethereum and EVM networks' />
      <meta property='og:site_name' content={titleDefault} />
      <meta property='og:description' content={description} />

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
      <meta name='twitter:image' content={ogImage} />
    </Head>
  )
}

export default Header
