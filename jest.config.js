// Jest config for the mymultisig-app. The previous version declared a
// `transform: { '\\.(js|jsx)?$': 'babel-jest' }` rule, which is what
// pulled @babel/helper-compilation-targets into the test runner. That
// package broke on Next.js 16's pinned lru-cache 9.x (`_lruCache is not
// a constructor` at cache-key time), and the babel-jest transform
// itself was unnecessary: ts-jest handles .ts files, and Node 20+ runs
// modern .js files natively. See CLAUDE.md "Known Issues" for the
// sibling lru-cache breakage that disabled next-pwa.
module.exports = {
  preset: 'ts-jest',
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/.storybook/'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  // Default transformIgnorePatterns skips node_modules, which is what we
  // want: nothing in this project ships ESM that needs transpiling.
  transformIgnorePatterns: ['/node_modules/', '\\.pnp\\.[^\\/]+$']
}
