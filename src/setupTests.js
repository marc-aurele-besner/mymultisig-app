// Required by jest.config.js setupFilesAfterEnv. Loads
// @testing-library/jest-dom matchers for React component tests. Pure
// logic tests (the slack lib's verify + crypto) don't need any DOM,
// but this file is required for jest to start at all.
//
// CommonJS require: the file is .js, not .ts, and ts-jest only
// transforms .ts/.tsx. Node 20+ natively runs both ESM and CJS, so
// `require` is the portable choice.
require('@testing-library/jest-dom')
