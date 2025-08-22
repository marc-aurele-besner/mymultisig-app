const withBundleAnalyzer = (() => {
  try {
    return require('@next/bundle-analyzer')({
      enabled: process.env.ANALYZE === 'true'
    })
  } catch (e) {
    return (config) => config
  }
})()

const withPWA = (() => {
  try {
    return require('next-pwa')({
      dest: 'public',
      disable: process.env.NODE_ENV === 'development'
    })
  } catch (e) {
    return (config) => config
  }
})()

const nextConfig = {
  experimental: {},
  images: {},
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack(config, { isServer }) {
    // Alias ethersV6 to ethers if ethersV6 is not installed
    config.resolve = config.resolve || {}
    config.resolve.alias = config.resolve.alias || {}
    if (!config.resolve.alias['ethersV6']) {
      config.resolve.alias['ethersV6'] = 'ethers'
    }

    // Optional audio support loaders
    try {
      const urlLoader = require.resolve('url-loader')
      const fileLoader = require.resolve('file-loader')
      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        exclude: config.exclude,
        use: [
          {
            loader: urlLoader,
            options: {
              limit: config.inlineImageLimit,
              fallback: fileLoader,
              publicPath: `${config.assetPrefix}/_next/static/images/`,
              outputPath: `${isServer ? '../' : ''}static/images/`,
              name: '[name]-[hash].[ext]',
              esModule: config.esModule || false
            }
          }
        ]
      })
    } catch (_e) {
      // Skip optional audio loader if packages are not available
    }

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
  const plugins = [[withPWA], [withBundleAnalyzer, {}]]

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
