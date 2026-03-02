const webpack = require('webpack')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

// Temporarily disabled due to lru-cache compatibility issue with Next.js 16
// TODO: Re-enable once next-pwa is updated or alternative solution is found
// const withPWA = require('next-pwa')({
//   dest: 'public',
//   disable: process.env.NODE_ENV === 'development'
// })
const withPWA = (config) => config // No-op function - PWA disabled temporarily

const nextConfig = {
  experimental: {},
  images: {},
  reactStrictMode: true,
  webpack(config, { isServer }) {
    // Fix for @chakra-ui/icons compatibility with Chakra UI v3
    // @chakra-ui/icons v2 tries to import createIcon, Icon, and forwardRef from @chakra-ui/react.
    // We use NormalModuleReplacementPlugin to only replace imports from @chakra-ui/icons.
    
    const shimPath = require.resolve('./chakra-react-shim.mjs')
    const path = require('path')
    const shimAbsolutePath = path.resolve(shimPath)
    const shimDir = path.dirname(shimAbsolutePath)
    
    // Create an alias so the shim can import the real package without interception
    config.resolve.alias = {
      ...config.resolve.alias,
      '@chakra-ui/react-real': require.resolve('@chakra-ui/react')
    }
    
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^@chakra-ui\/react$/,
        (resource) => {
          // Get the issuer/resource information from multiple sources
          const context = resource.context || ''
          const issuer = resource.contextInfo?.issuer || ''
          const resourcePath = resource.resource || ''
          const createData = resource.createData || {}
          const userRequest = createData.userRequest || resource.request || ''
          
          // Check if the import is from the shim itself (avoid circular dependency)
          const normalizedContext = context ? path.normalize(context) : ''
          const normalizedIssuer = issuer ? path.normalize(issuer) : ''
          const normalizedShimDir = path.normalize(shimDir)
          const normalizedShimPath = path.normalize(shimAbsolutePath)
          
          const isFromShim = 
            normalizedContext === normalizedShimDir ||
            normalizedIssuer === normalizedShimPath ||
            normalizedContext.includes('chakra-react-shim') ||
            normalizedIssuer.includes('chakra-react-shim') ||
            resourcePath.includes('chakra-react-shim') ||
            userRequest === shimPath ||
            userRequest.includes('chakra-react-shim')
          
          // Only replace if the import is coming from @chakra-ui/icons
          const isFromIcons = (context.includes('@chakra-ui/icons') || 
                               issuer.includes('@chakra-ui/icons') ||
                               resourcePath.includes('@chakra-ui/icons') ||
                               userRequest.includes('@chakra-ui/icons')) &&
                              !isFromShim
          
          if (isFromIcons) {
            resource.request = shimPath
          }
        }
      )
    )

    return config
  }
}

// manage i18n
// if (process.env.EXPORT !== 'true') {
//   nextConfig.i18n = {
//     locales: ['en', 'fr', 'jp'],
//     defaultLocale: 'en'
//   }
// }

const KEYS_TO_OMIT = ['webpackDevMiddleware', 'configOrigin', 'target', 'analyticsId', 'webpack5', 'amp', 'assetPrefix']

module.exports = (_phase, { defaultConfig }) => {
  const plugins = [
    [withPWA, {}],
    [withBundleAnalyzer, {}]
  ]

  const wConfig = plugins.reduce((acc, [plugin, config]) => plugin({ ...acc, ...config }), {
    ...defaultConfig,
    ...nextConfig
  })

  const finalConfig = {}
  Object.keys(wConfig).forEach((key) => {
    if (!KEYS_TO_OMIT.includes(key)) {
      finalConfig[key] = wConfig[key]
    }
  })

  return finalConfig
}
