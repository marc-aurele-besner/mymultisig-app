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
