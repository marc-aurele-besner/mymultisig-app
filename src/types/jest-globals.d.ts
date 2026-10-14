// Ambient declarations for the Jest test runner. The repo's tsconfig
// uses `"types": []` (so legacy @types/* packages are not auto-included),
// and Jest 30+ no longer ships ambient globals from the `jest` package —
// `describe`, `it`, `expect`, etc. now live in `@jest/globals` as named
// exports, while `jest.fn` / `jest.spyOn` / `jest.doMock` / `jest.isolateModules`
// live on `jest`'s named `jest` namespace. Without this shim, `next build`
// fails type-checking every `*.test.ts` file with TS2304/TS2593 (exposed
// by the Next.js 16.4 strict TS pass on the whole tree).
//
// Re-declare the ones we actually use as globals + namespace so existing
// tests keep their `describe(...)` / `it(...)` / `jest.fn(...)` style
// without an import line at the top of every file.

import type {
  afterAll as AfterAllType,
  afterEach as AfterEachType,
  beforeAll as BeforeAllType,
  beforeEach as BeforeEachType,
  describe as DescribeType,
  expect as ExpectType,
  it as ItType,
  jest as JestType
} from '@jest/globals'

declare global {
   
  const describe: typeof DescribeType
  const it: typeof ItType
  const expect: typeof ExpectType
  const beforeAll: typeof BeforeAllType
  const beforeEach: typeof BeforeEachType
  const afterAll: typeof AfterAllType
  const afterEach: typeof AfterEachType
  // The `jest` object (jest.fn, jest.spyOn, jest.doMock, jest.resetModules,
  // jest.isolateModules, ...). `jest` is exported as a value from
  // `@jest/globals` in Jest 30+.
   
  const jest: typeof JestType
}

export {}